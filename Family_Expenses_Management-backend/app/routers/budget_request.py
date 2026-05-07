# app/routers/budget_requests.py
from fastapi import APIRouter, HTTPException, status, Depends, Form
from bson import ObjectId
from typing import List
from datetime import datetime

from app.core.utils import get_current_user, check_role, send_email
from app.core.email_templates import budget_request_admin_template, budget_approved_template, budget_denied_template
from app.models.user import User
from app.models.budget_request import BudgetRequest
from app.schemas.budget_request import BudgetRequestCreate, BudgetRequestOut
from app.db import budget_requests_collection, users_collection, budgets_collection, expense_categories_collection, notifications_collection

router = APIRouter(
    prefix="/budget-requests",
    tags=["Budget Requests"]
)

@router.post("/", response_model=BudgetRequestOut, status_code=status.HTTP_201_CREATED)
async def create_budget_request(
    category_id: str = Form(...),
    month: int = Form(...),
    year: int = Form(...),
    requested_amount: float = Form(...),
    current_user: User = Depends(get_current_user)
):
    """
    Gửi yêu cầu tăng ngân sách cho danh mục cụ thể.
    """
    # Kiểm tra danh mục có tồn tại và thuộc gia đình
    category = await expense_categories_collection.find_one({
        "_id": ObjectId(category_id),
        "family_id": current_user.family_id
    })
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại hoặc không thuộc gia đình bạn.")

    # Kiểm tra xem đã có ngân sách hiện tại cho danh mục, tháng, năm cụ thể chưa
    budget = await budgets_collection.find_one({
        "family_id": current_user.family_id,
        "user_id": str(current_user.id),
        "category_id": category_id,
        "month": month,
        "year": year
    })
    
    current_budget = budget["amount"] if budget else 0.0

    # Kiểm tra xem đã có yêu cầu đang chờ phê duyệt cho danh mục này chưa
    existing_request = await budget_requests_collection.find_one({
        "user_id": str(current_user.id),
        "category_id": category_id,
        "month": month,
        "year": year,
        "status": "pending"
    })
    if existing_request:
        raise HTTPException(status_code=400, detail="Bạn đã có một yêu cầu đang chờ phê duyệt cho danh mục này.")

    # Tạo yêu cầu tăng ngân sách
    budget_request = {
        "user_id": str(current_user.id),
        "category_id": category_id,
        "requested_amount": requested_amount,
        "current_budget": current_budget,
        "month": month,
        "year": year,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await budget_requests_collection.insert_one(budget_request)
    new_request = await budget_requests_collection.find_one({"_id": result.inserted_id})

    # Lấy thông tin fullname từ bảng users
    user = await users_collection.find_one({"_id": ObjectId(new_request["user_id"])})
    new_request["fullname"] = user["fullname"] if user else "Unknown User"

    # Lấy thông tin category_name từ bảng expense_categories
    category_name = category["name"] if category else "Unknown Category"
    new_request["category_name"] = category_name

    # Gửi thông báo đến admin (email + in-app)
    admin = await users_collection.find_one({"family_id": current_user.family_id, "role": "admin"})
    if admin and admin.get("email"):
        subject = "📋 Yêu Cầu Tăng Ngân Sách"
        # Sử dụng HTML template chuyên nghiệp
        html_body = budget_request_admin_template(
            admin_name=admin.get("fullname", "Admin"),
            requester_name=current_user.fullname,
            category_name=category_name,
            current_budget=f"{current_budget:,.0f} đ",
            requested_amount=f"{requested_amount:,.0f} đ",
            month=month,
            year=year,
        )
        # Kiểm tra notification_settings trước khi gửi email
        admin_notif_settings = admin.get("notification_settings", {})
        if admin_notif_settings.get("email", True):
            await send_email(admin["email"], subject, html_body)
        # Thông báo in-app cho admin
        await notifications_collection.insert_one({
            "user_id": str(admin["_id"]),
            "title": "Yêu cầu tăng ngân sách",
            "message": f"{current_user.fullname} yêu cầu tăng ngân sách danh mục '{category_name}' lên {requested_amount:,.0f} đ (tháng {month}/{year}).",
            "type": "budget_request",
            "is_read": False,
            "created_at": datetime.utcnow(),
            "related_id": new_request["_id"],
        })

    new_request["_id"] = str(new_request["_id"])
    return BudgetRequestOut(**new_request)



@router.get("/pending", response_model=List[BudgetRequestOut])
async def get_pending_requests(
    current_user: User = Depends(check_role("admin"))
):
    requests = []
    cursor = budget_requests_collection.find({"status": "pending"})
    
    async for req in cursor:
        # Chuyển đổi ObjectId sang string
        req["_id"] = str(req["_id"])

        # Lấy thông tin user từ bảng users
        user = await users_collection.find_one({"_id": ObjectId(req["user_id"])})
        req["fullname"] = user["fullname"] if user else "Unknown User"

        # Lấy thông tin danh mục chi tiêu từ bảng expense_categories
        category = await expense_categories_collection.find_one({"_id": ObjectId(req["category_id"])})
        req["category_name"] = category["name"] if category else "Unknown Category"
        
        # Thêm yêu cầu vào danh sách
        requests.append(BudgetRequestOut(**req))
    
    return requests


# Endpoint cho admin phê duyệt yêu cầu
@router.put("/approve/{request_id}", response_model=BudgetRequestOut)
async def approve_budget_request(
    request_id: str,
    current_user: User = Depends(check_role("admin"))
):
    budget_request = await budget_requests_collection.find_one({"_id": ObjectId(request_id)})
    if not budget_request:
        raise HTTPException(status_code=404, detail="Không tìm thấy yêu cầu.")
    if budget_request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Yêu cầu đã được xử lý.")

    # Cập nhật ngân sách
    new_budget_amount = budget_request["requested_amount"]
    result = await budgets_collection.update_one(
        {"family_id": current_user.family_id, "user_id": budget_request["user_id"], "category_id": budget_request["category_id"], "month": budget_request["month"], "year": budget_request["year"]},
        {"$inc": {"amount": new_budget_amount}},
        upsert=True
    )
    if result.matched_count == 0 and result.upserted_id is None:
        raise HTTPException(status_code=500, detail="Cập nhật ngân sách thất bại.")

    # Cập nhật trạng thái yêu cầu
    await budget_requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "approved", "updated_at": datetime.utcnow()}}
    )
    updated_request = await budget_requests_collection.find_one({"_id": ObjectId(request_id)})

    # Lấy thông tin fullname từ bảng users
    user = await users_collection.find_one({"_id": ObjectId(updated_request["user_id"])})
    updated_request["fullname"] = user["fullname"] if user else "Unknown User"

    # Lấy thông tin category_name từ bảng expense_categories
    category = await expense_categories_collection.find_one({"_id": ObjectId(updated_request["category_id"])})
    updated_request["category_name"] = category["name"] if category else "Unknown Category"

    # Gửi email thông báo + in-app cho thành viên
    if user and user.get("email"):
        subject = "✅ Yêu Cầu Tăng Ngân Sách Đã Được Phê Duyệt"
        # Sử dụng HTML template chuyên nghiệp
        html_body = budget_approved_template(
            user_name=user.get("fullname", "Người dùng"),
            category_name=updated_request.get('category_name', ''),
            added_amount=f"{new_budget_amount:,.0f} đ",
            month=budget_request.get("month", 0),
            year=budget_request.get("year", 0),
        )
        # Kiểm tra notification_settings trước khi gửi email
        user_notif_settings = user.get("notification_settings", {})
        if user_notif_settings.get("email", True):
            await send_email(user["email"], subject, html_body)
        # Thông báo in-app
        await notifications_collection.insert_one({
            "user_id": str(user["_id"]),
            "title": "✅ Yêu cầu ngân sách được duyệt",
            "message": f"Yêu cầu tăng ngân sách danh mục '{updated_request.get('category_name', '')}' của bạn đã được phê duyệt. Ngân sách được tăng thêm {new_budget_amount:,.0f} đ.",
            "type": "budget_approved",
            "is_read": False,
            "created_at": datetime.utcnow(),
            "related_id": request_id,
        })

    updated_request["_id"] = str(updated_request["_id"])
    return BudgetRequestOut(**updated_request)


# Endpoint cho admin từ chối yêu cầu
@router.put("/deny/{request_id}", response_model=BudgetRequestOut)
async def deny_budget_request(
    request_id: str,
    current_user: User = Depends(check_role("admin"))
):
    budget_request = await budget_requests_collection.find_one({"_id": ObjectId(request_id)})
    if not budget_request:
        raise HTTPException(status_code=404, detail="Không tìm thấy yêu cầu.")
    if budget_request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Yêu cầu đã được xử lý.")

    # Cập nhật trạng thái yêu cầu
    await budget_requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "denied", "updated_at": datetime.utcnow()}}
    )
    updated_request = await budget_requests_collection.find_one({"_id": ObjectId(request_id)})

    # Lấy thông tin fullname từ bảng users
    user = await users_collection.find_one({"_id": ObjectId(updated_request["user_id"])})
    updated_request["fullname"] = user["fullname"] if user else "Unknown User"

    # Lấy thông tin category_name từ bảng expense_categories
    category = await expense_categories_collection.find_one({"_id": ObjectId(updated_request["category_id"])})
    updated_request["category_name"] = category["name"] if category else "Unknown Category"

    # Gửi email thông báo + in-app cho thành viên
    if user and user.get("email"):
        subject = "❌ Yêu Cầu Tăng Ngân Sách Đã Bị Từ Chối"
        # Sử dụng HTML template chuyên nghiệp
        html_body = budget_denied_template(
            user_name=user.get("fullname", "Người dùng"),
            category_name=updated_request.get('category_name', ''),
            requested_amount=f"{budget_request.get('requested_amount', 0):,.0f} đ",
            month=budget_request.get("month", 0),
            year=budget_request.get("year", 0),
        )
        # Kiểm tra notification_settings trước khi gửi email
        user_notif_settings = user.get("notification_settings", {})
        if user_notif_settings.get("email", True):
            await send_email(user["email"], subject, html_body)
        # Thông báo in-app
        await notifications_collection.insert_one({
            "user_id": str(user["_id"]),
            "title": "❌ Yêu cầu ngân sách bị từ chối",
            "message": f"Yêu cầu tăng ngân sách danh mục '{updated_request.get('category_name', '')}' của bạn đã bị từ chối.",
            "type": "budget_denied",
            "is_read": False,
            "created_at": datetime.utcnow(),
            "related_id": request_id,
        })

    updated_request["_id"] = str(updated_request["_id"])
    return BudgetRequestOut(**updated_request)
