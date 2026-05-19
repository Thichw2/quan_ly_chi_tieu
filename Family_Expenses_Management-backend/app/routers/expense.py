# app/routers/expense.py

from fastapi import APIRouter, HTTPException, status, Depends, Form
from bson import ObjectId
from typing import Dict, List, Optional
from datetime import datetime, date, timedelta
from fastapi.encoders import jsonable_encoder
from app.core.utils import get_current_user, send_email
from app.core.email_templates import budget_exceeded_user_template, budget_exceeded_admin_template
from app.models.user import User
from app.db import expenses_collection, expense_categories_collection, users_collection, budgets_collection, families_collection, notifications_collection
from app.schemas.expense import ExpenseOut
from app.core.config import settings
from app.schemas.family_data import CategoryData, FamilyData, MemberSpentData, RecentExpense
from app.schemas.member_data import MemberCategoryData, MemberData, MemberDataMap
from app.schemas.monthly_data import MonthlyData, MonthlyDataResponse

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


async def _push_notification(user_id: str, title: str, message: str, ntype: str, related_id: str = None):
    """Helper nội bộ để ghi thông báo vào DB."""
    await notifications_collection.insert_one({
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": ntype,
        "is_read": False,
        "created_at": datetime.utcnow(),
        "related_id": related_id,
    })


@router.get("/check-budget")
async def check_budget_before_expense(
    category_id: str,
    amount: float,
    date_str: str,
    target_user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """
    Kiểm tra ngân sách trước khi tạo chi tiêu.
    Trả về thông tin ngân sách, tổng chi tiêu hiện tại, và liệu có vượt ngân sách không.
    """
    try:
        expense_date = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format (YYYY-MM-DD)")

    # Xác định user thực sự
    if target_user_id and target_user_id != str(current_user.id):
        owner_id = target_user_id
    else:
        owner_id = str(current_user.id)

    # Tìm ngân sách chính xác cho user + category + tháng/năm
    budget = await budgets_collection.find_one({
        "category_id": category_id,
        "family_id": str(current_user.family_id),
        "user_id": owner_id,
        "month": expense_date.month,
        "year": expense_date.year,
    })

    if not budget:
        return {
            "has_budget": False,
            "budget_amount": 0,
            "current_spent": 0,
            "new_total": amount,
            "would_exceed": False,
            "category_name": "",
        }

    budget_amount = budget["amount"]

    # Tính tổng chi tiêu hiện tại trong tháng
    start_date = datetime(expense_date.year, expense_date.month, 1)
    end_date = datetime(
        expense_date.year + (1 if expense_date.month == 12 else 0),
        1 if expense_date.month == 12 else expense_date.month + 1, 1
    )
    pipeline = [
        {
            "$match": {
                "category_id": category_id,
                "user_id": owner_id,
                "date": {"$gte": start_date, "$lt": end_date}
            }
        },
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    agg_result = await expenses_collection.aggregate(pipeline).to_list(length=1)
    current_spent = agg_result[0]["total"] if agg_result else 0.0
    new_total = current_spent + amount

    # Lấy tên danh mục
    category_doc = await expense_categories_collection.find_one({"_id": ObjectId(category_id)})
    cat_name = category_doc.get("name", "") if category_doc else ""

    return {
        "has_budget": True,
        "budget_amount": budget_amount,
        "current_spent": current_spent,
        "new_total": new_total,
        "would_exceed": new_total > budget_amount,
        "category_name": cat_name,
    }


@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
async def create_expense(
    category_id: str = Form(...),
    amount: float = Form(...),
    date_str: str = Form(...),  # Nhận ngày dưới dạng string (YYYY-MM-DD)
    description: Optional[str] = Form(None),
    target_user_id: Optional[str] = Form(None),  # Admin có thể chỉ định thành viên
    current_user: User = Depends(get_current_user)
):
    """
    Tạo một khoản chi tiêu mới.
    - Admin có thể tạo cho bất kỳ thành viên nào trong gia đình qua target_user_id.
    - Member chỉ tạo được cho bản thân.
    - Gửi thông báo in-app và email khi vượt ngân sách.
    """
    # Chuyển đổi date_str thành datetime
    try:
        expense_date = date.fromisoformat(date_str)
        expense_datetime = datetime.combine(expense_date, datetime.min.time())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format (YYYY-MM-DD)")

    # Xác định user thực sự của expense
    if target_user_id and target_user_id != str(current_user.id):
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Chỉ admin mới có thể thêm chi tiêu cho thành viên khác.")
        # Kiểm tra target_user thuộc cùng gia đình
        if not ObjectId.is_valid(target_user_id):
            raise HTTPException(status_code=400, detail="Invalid target user ID format.")
        target_user = await users_collection.find_one(
            {"_id": ObjectId(target_user_id), "family_id": current_user.family_id}
        )
        if not target_user:
            raise HTTPException(status_code=404, detail="Thành viên không tồn tại trong gia đình.")
        expense_owner_id = target_user_id
        expense_owner = target_user
    else:
        expense_owner_id = str(current_user.id)
        expense_owner = None  # sẽ dùng current_user

    # Tìm ngân sách cho danh mục (theo user + tháng/năm cụ thể của chi tiêu)
    budget = await budgets_collection.find_one({
        "category_id": category_id,
        "family_id": str(current_user.family_id),
        "user_id": expense_owner_id,
        "month": expense_date.month,
        "year": expense_date.year,
    })

    # Gửi thông báo yêu cầu tạo ngân sách nếu không tìm thấy
    if not budget:
        admin_user = await users_collection.find_one({"family_id": current_user.family_id, "role": "admin"})
        category = await expense_categories_collection.find_one({"_id": ObjectId(category_id)})
        cat_name = category.get('name', 'Unknown Category') if category else 'Unknown Category'
        if admin_user:
            subject = "Yêu Cầu Tạo Ngân Sách"
            body = (f"Người dùng '{current_user.username}' đã yêu cầu tạo ngân sách cho danh mục '{cat_name}'. "
                    f"Vui lòng kiểm tra yêu cầu này.")
            # Kiểm tra notification_settings trước khi gửi email
            admin_notif_settings = admin_user.get("notification_settings", {})
            if admin_notif_settings.get("email", True):
                await send_email(admin_user["email"], subject, body)
            # Thông báo in-app cho admin
            await _push_notification(
                str(admin_user["_id"]),
                "Yêu cầu tạo ngân sách",
                f"{current_user.fullname} yêu cầu tạo ngân sách cho danh mục '{cat_name}'.",
                "budget_request"
            )
        raise HTTPException(
            status_code=400,
            detail="Danh mục này chưa có ngân sách. Đã gửi thông báo tới admin."
        )

    expected_amount = budget["amount"]

    # Tính tổng chi tiêu hiện tại cho owner
    start_date = datetime(expense_date.year, expense_date.month, 1)
    end_date = datetime(
        expense_date.year + (1 if expense_date.month == 12 else 0),
        1 if expense_date.month == 12 else expense_date.month + 1, 1
    )
    pipeline = [
        {
            "$match": {
                "category_id": category_id,
                "user_id": expense_owner_id,
                "date": {"$gte": start_date, "$lt": end_date}
            }
        },
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    agg_result = await expenses_collection.aggregate(pipeline).to_list(length=1)
    current_total = agg_result[0]["total"] if agg_result else 0.0
    new_total = current_total + amount

    # Thêm chi tiêu vào database
    category_info = await expense_categories_collection.find_one({"_id": ObjectId(category_id)})
    cat_name = category_info.get("name", "Unknown") if category_info else "Unknown"

    expense_data = {
        "category_id": category_id,
        "user_id": expense_owner_id,
        "amount": amount,
        "date": expense_datetime,
        "description": description
    }
    result = await expenses_collection.insert_one(expense_data)
    new_expense = await expenses_collection.find_one({"_id": result.inserted_id})
    expense_id_str = str(result.inserted_id)

    # Bổ sung thông tin category_name và fullname
    new_expense["category_name"] = cat_name
    if expense_owner:  # admin tạo cho member khác
        new_expense["fullname"] = expense_owner.get("fullname", "Unknown")
        # Thông báo cho member bị thêm chi tiêu
        await _push_notification(
            expense_owner_id,
            "Chi tiêu mới được thêm",
            f"Admin đã thêm khoản chi tiêu {amount:,.0f} đ cho danh mục '{cat_name}'.",
            "expense_added",
            expense_id_str
        )
    else:
        new_expense["fullname"] = current_user.fullname

    # Gửi thông báo nếu vượt ngân sách
    if new_total > expected_amount:
        subject = "⚠️ Thông Báo Vượt Mức Chi Tiêu"
        owner_id_str = expense_owner_id
        owner_email = expense_owner["email"] if expense_owner else current_user.email
        owner_name = expense_owner.get("fullname", expense_owner.get("username")) if expense_owner else current_user.fullname
        expense_month = expense_date.month
        expense_year = expense_date.year
        fmt_total = f"{new_total:,.0f} đ"
        fmt_budget = f"{expected_amount:,.0f} đ"

        # Thông báo in-app cho owner
        await _push_notification(
            owner_id_str,
            "⚠️ Vượt mức chi tiêu!",
            f"Tổng chi tiêu danh mục '{cat_name}' tháng này là {fmt_total}, vượt ngân sách {fmt_budget}.",
            "budget_exceeded",
            expense_id_str
        )

        if current_user.role == "admin":
            # Admin tạo expense → gửi email cho admin
            html_body = budget_exceeded_user_template(
                user_name=current_user.fullname,
                category_name=cat_name,
                current_total=fmt_total,
                budget_amount=fmt_budget,
                month=expense_month,
                year=expense_year,
            )
            owner_notif = await users_collection.find_one({"_id": ObjectId(str(current_user.id))})
            if owner_notif and owner_notif.get("notification_settings", {}).get("email", True):
                await send_email(current_user.email, subject, html_body)
        else:
            # Member tạo expense → gửi email cho member + admin
            # Email cho member
            owner_doc = expense_owner if expense_owner else await users_collection.find_one({"_id": ObjectId(expense_owner_id)})
            owner_notif_settings = owner_doc.get("notification_settings", {}) if owner_doc else {}
            if owner_notif_settings.get("email", True):
                user_html = budget_exceeded_user_template(
                    user_name=owner_name,
                    category_name=cat_name,
                    current_total=fmt_total,
                    budget_amount=fmt_budget,
                    month=expense_month,
                    year=expense_year,
                )
                await send_email(owner_email, subject, user_html)

            # Email cho admin
            admin = await users_collection.find_one({"family_id": current_user.family_id, "role": "admin"})
            if admin and admin["email"] != owner_email:
                admin_notif_settings = admin.get("notification_settings", {})
                if admin_notif_settings.get("email", True):
                    admin_html = budget_exceeded_admin_template(
                        admin_name=admin.get("fullname", "Admin"),
                        member_name=owner_name,
                        category_name=cat_name,
                        current_total=fmt_total,
                        budget_amount=fmt_budget,
                        month=expense_month,
                        year=expense_year,
                    )
                    await send_email(admin["email"], subject, admin_html)
                # Thông báo in-app cho admin
                await _push_notification(
                    str(admin["_id"]),
                    "⚠️ Thành viên vượt ngân sách",
                    f"{owner_name} vượt ngân sách danh mục '{cat_name}': {fmt_total} / {fmt_budget}.",
                    "budget_exceeded",
                    expense_id_str
                )

    new_expense["_id"] = str(new_expense["_id"])  # Chuyển ObjectId sang string
    return ExpenseOut(**new_expense)



@router.get("/", response_model=List[ExpenseOut])
async def get_expenses(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Lấy danh sách chi tiêu:
    - Admin: xem toàn bộ chi tiêu của gia đình.
    - Member: chỉ xem chi tiêu của bản thân.
    """
    expenses = []

    if not current_user.family_id:
        return []

    # Lấy tất cả user_id trong cùng gia đình
    family_users = await users_collection.find(
        {"family_id": current_user.family_id}
    ).to_list(None)
    family_user_ids = [str(u["_id"]) for u in family_users]
    query = {"user_id": {"$in": family_user_ids}}

    if month is not None and year is not None:
        start_date = datetime(year, month, 1)
        end_date = datetime(year + (1 if month == 12 else 0), 1 if month == 12 else month + 1, 1)
        query["date"] = {"$gte": start_date, "$lt": end_date}
    elif year is not None:
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)
        query["date"] = {"$gte": start_date, "$lt": end_date}

    cursor = expenses_collection.find(query).sort("date", -1)

    async for exp in cursor:
        exp["_id"] = str(exp["_id"])
        exp["date"] = exp["date"].isoformat()  # Chuyển datetime thành string ISO

        # Lấy tên danh mục
        try:
            category = await expense_categories_collection.find_one({"_id": ObjectId(exp["category_id"])})
            exp["category_name"] = category.get("name", "Unknown") if category else "Unknown"
        except Exception:
            exp["category_name"] = "Unknown"

        # Lấy tên người dùng
        try:
            user = await users_collection.find_one({"_id": ObjectId(exp["user_id"])})
            exp["fullname"] = user.get("fullname", "Unknown") if user else "Unknown"
        except Exception:
            exp["fullname"] = "Unknown"

        expenses.append(ExpenseOut(**exp))

    return expenses



@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(
    expense_id: str,
    category_id: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    date_str: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Cập nhật một khoản chi tiêu cụ thể.
    """
    # Kiểm tra ObjectId hợp lệ
    if not ObjectId.is_valid(expense_id):
        raise HTTPException(status_code=400, detail="Invalid expense ID format.")

    existing_exp = await expenses_collection.find_one({"_id": ObjectId(expense_id), "user_id": str(current_user.id)})
    if not existing_exp:
        raise HTTPException(status_code=404, detail="Expense not found.")

    update_data = {}
    if category_id:
        if not ObjectId.is_valid(category_id):
            raise HTTPException(status_code=400, detail="Invalid category ID format.")
        update_data["category_id"] = category_id
    if amount is not None:
        update_data["amount"] = amount
    if date_str:
        try:
            expense_date = date.fromisoformat(date_str)
            update_data["date"] = datetime.combine(expense_date, datetime.min.time())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format (YYYY-MM-DD)")
    if description:
        update_data["description"] = description

    # Thực hiện cập nhật
    result = await expenses_collection.update_one({"_id": ObjectId(expense_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found for update.")
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="No changes were made to the expense.")

    # Lấy dữ liệu mới cập nhật
    updated_exp = await expenses_collection.find_one({"_id": ObjectId(expense_id)})
    updated_exp["_id"] = str(updated_exp["_id"])
    updated_exp["date"] = updated_exp["date"].isoformat()

    # Bổ sung thông tin category_name
    if "category_id" in updated_exp and ObjectId.is_valid(updated_exp["category_id"]):
        category = await expense_categories_collection.find_one({"_id": ObjectId(updated_exp["category_id"])})
        updated_exp["category_name"] = category["name"] if category else "Unknown Category"
    else:
        updated_exp["category_name"] = "Unknown Category"

    # Bổ sung thông tin fullname
    if "user_id" in updated_exp and ObjectId.is_valid(updated_exp["user_id"]):
        user = await users_collection.find_one({"_id": ObjectId(updated_exp["user_id"])})
        updated_exp["fullname"] = user["fullname"] if user else "Unknown User"
    else:
        updated_exp["fullname"] = "Unknown User"

    return ExpenseOut(**updated_exp)




@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: str, current_user: User = Depends(get_current_user)):
    """
    Xóa một khoản chi tiêu cụ thể.
    """
    existing_exp = await expenses_collection.find_one({"_id": ObjectId(expense_id), "user_id": str(current_user.id)})
    if not existing_exp:
        raise HTTPException(status_code=404, detail="Expense not found.")

    result = await expenses_collection.delete_one({"_id": ObjectId(expense_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Expense deletion failed")
    return
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
# Giả định các Schema và Collection đã được import đúng

@router.get("/family-data", response_model=FamilyData)
async def get_family_data(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    raw_family_id = current_user.family_id
    if not raw_family_id:
        raise HTTPException(status_code=400, detail="Người dùng chưa thuộc gia đình nào.")
    
    # Ép kiểu family_id sang string để khớp với bảng budgets
    family_id_str = str(raw_family_id)
    now = datetime.utcnow()
    current_month = month if month else now.month
    current_year = year if year else now.year
    
    # 1. Map thông tin User & Category
    users = await users_collection.find({"family_id": raw_family_id}).to_list(None)
    user_map = {str(u["_id"]): (u.get("fullname") or u.get("username")) for u in users}
    user_ids = list(user_map.keys())
    
    categories = await expense_categories_collection.find({"family_id": raw_family_id}).to_list(None)
    cat_map = {str(c["_id"]): c["name"] for c in categories}
    
    # 2. Lấy Ngân sách tháng hiện tại
    budgets_raw = await budgets_collection.find({
        "family_id": family_id_str,
        "month": current_month,
        "year": current_year
    }).to_list(None)
    
    total_family_budget = sum(b.get("amount", 0.0) for b in budgets_raw)
    member_budgets_map = {uid: 0.0 for uid in user_ids}
    for b in budgets_raw:
        uid = b.get("user_id")
        if uid in member_budgets_map:
            member_budgets_map[uid] += b.get("amount", 0.0)
            
    # 3. Lấy Chi tiêu trong tháng hiện tại
    start_date = datetime(current_year, current_month, 1)
    end_date = datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime(current_year + 1, 1, 1)
    
    expenses = await expenses_collection.find({
        "user_id": {"$in": user_ids},
        "date": {"$gte": start_date, "$lt": end_date}
    }).to_list(None)
    
    total_family_spent = sum(e.get("amount", 0.0) for e in expenses)
    member_spent_map = {uid: 0.0 for uid in user_ids}
    category_sum_map = {}
    
    for e in expenses:
        uid = e.get("user_id")
        if uid in member_spent_map:
            member_spent_map[uid] += e.get("amount", 0.0)
        cid = e.get("category_id")
        if cid:
            category_sum_map[cid] = category_sum_map.get(cid, 0.0) + e.get("amount", 0.0)

    # 4. Đóng gói Member Data (Gồm cả Spent và Budget cá nhân)
    member_data_list = [
        MemberSpentData(
            name=user_map.get(uid, "Thành viên"),
            amount=member_spent_map[uid],
            budget=member_budgets_map[uid]
        ) for uid in user_ids
    ]
    
    # 5. Đóng gói Category Data
    category_data = [CategoryData(name=cat_map.get(cid, "Khác"), value=val) for cid, val in category_sum_map.items()]
    
    # 6. Giao dịch gần đây
    recent_raw = await expenses_collection.find({"user_id": {"$in": user_ids}}).sort("date", -1).limit(5).to_list(5)
    recent_list = [
        RecentExpense(
            id=str(r["_id"]),
            name=r.get("description") or "Chi tiêu không tiêu đề",
            amount=r.get("amount", 0.0),
            category=cat_map.get(r.get("category_id"), "Khác"),
            member=user_map.get(r.get("user_id"), "Thành viên")
        ) for r in recent_raw
    ]

    return FamilyData(
        totalBudget=total_family_budget,
        totalSpent=total_family_spent,
        categoryData=category_data,
        memberData=member_data_list,
        recentExpenses=recent_list
    )


@router.get("/member-data", response_model=MemberDataMap)
async def get_member_data(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Lấy dữ liệu chi tiết về từng thành viên trong gia đình, bao gồm ngân sách, tổng chi tiêu và chi tiêu theo danh mục.
    """
    family_id = current_user.family_id
    if not family_id:
        raise HTTPException(status_code=400, detail="User does not belong to any family.")
    
    # 1. Lấy tất cả thành viên trong gia đình
    users_cursor = users_collection.find({"family_id": family_id})
    users = await users_cursor.to_list(length=None)
    user_ids = [str(user["_id"]) for user in users]
    user_fullname_map = {str(user["_id"]): user["fullname"] for user in users}
    
    # 2. Lấy tất cả categories trong gia đình
    categories_cursor = expense_categories_collection.find({"family_id": family_id})
    categories = await categories_cursor.to_list(length=None)
    category_id_name_map = {str(cat["_id"]): cat["name"] for cat in categories}
    
    # 3. Lấy budgets cho từng thành viên trong tháng và năm hiện tại
    now = datetime.utcnow()
    current_month = month if month else now.month
    current_year = year if year else now.year
    
    budgets_cursor = budgets_collection.find({
        "family_id": family_id,
        "month": current_month,
        "year": current_year,
        "user_id": {"$in": user_ids}
    })
    budgets = await budgets_cursor.to_list(length=None)
    user_budget_map = {budget["user_id"]: budget.get("amount", 0.0) for budget in budgets}
    
    # 4. Lấy tất cả expenses trong gia đình, trong tháng và năm hiện tại
    expenses_cursor = expenses_collection.find({
        "user_id": {"$in": user_ids},
        "date": {
            "$gte": datetime(current_year, current_month, 1),
            "$lt": datetime(current_year, (current_month % 12) + 1, 1)
        }
    })
    expenses = await expenses_cursor.to_list(length=None)
    
    # 5. Tính tổng chi tiêu và chi tiêu theo category cho từng thành viên
    member_spent_map: Dict[str, float] = {user_id: 0.0 for user_id in user_ids}
    member_category_map: Dict[str, Dict[str, float]] = {user_id: {} for user_id in user_ids}
    
    for expense in expenses:
        user_id = expense.get("user_id")
        amount = expense.get("amount", 0.0)
        category_id = expense.get("category_id")
        category_name = category_id_name_map.get(category_id, "Unknown")
        
        # Tính tổng chi tiêu
        member_spent_map[user_id] += amount
        
        # Tính chi tiêu theo category
        if category_name in member_category_map[user_id]:
            member_category_map[user_id][category_name] += amount
        else:
            member_category_map[user_id][category_name] = amount
    
    # 6. Tạo MemberDataMap
    members_data = {}
    for user_id in user_ids:
        fullname = user_fullname_map.get(user_id, "Unknown")
        total_budget = user_budget_map.get(user_id, 0.0)
        total_spent = member_spent_map.get(user_id, 0.0)
        
        # Tạo categoryData cho từng thành viên
        categories_data = []
        category_spent = member_category_map.get(user_id, {})
        for category_name, value in category_spent.items():
            categories_data.append(MemberCategoryData(
                name=category_name,
                value=value
            ))
        
        # Thêm các category không có chi tiêu với giá trị 0
        for cat_name in category_id_name_map.values():
            if cat_name not in category_spent:
                categories_data.append(MemberCategoryData(
                    name=cat_name,
                    value=0.0
                ))
        
        members_data[fullname] = MemberData(
            totalBudget=total_budget,
            totalSpent=total_spent,
            categoryData=categories_data
        )
    
    member_data_map = MemberDataMap(members=members_data)
    return member_data_map


@router.get("/monthly-data", response_model=MonthlyDataResponse)
async def get_monthly_data(current_user: User = Depends(get_current_user)):
    """
    Lấy tổng chi phí, ngân sách và tiết kiệm hàng tháng cho gia đình hiện tại.
    """
    family_id = current_user.family_id
    if not family_id:
        raise HTTPException(status_code=400, detail="User does not belong to any family.")
    
    # 1. Lấy tất cả user_ids trong gia đình
    users_cursor = users_collection.find({"family_id": family_id})
    users = await users_cursor.to_list(length=None)
    user_ids = [str(user["_id"]) for user in users]
    
    # 2. Xác định năm hiện tại hoặc có thể thêm tham số year nếu muốn
    now = datetime.utcnow()
    current_year = now.year
    
    # 3. Lấy tổng ngân sách hàng tháng cho gia đình
    # Aggregation: Group by month, sum budgets
    budget_pipeline = [
        {
            "$match": {
                "family_id": family_id,
                "year": current_year,
                "user_id": {"$in": user_ids}
            }
        },
        {
            "$group": {
                "_id": "$month",
                "totalBudget": {"$sum": "$amount"}
            }
        }
    ]
    budget_aggregation = budgets_collection.aggregate(budget_pipeline)
    budgets = await budget_aggregation.to_list(length=None)
    budget_map = {str(doc["_id"]): doc["totalBudget"] for doc in budgets}
    
    # 4. Lấy tổng chi phí hàng tháng cho gia đình
    # Aggregation: Group by month, sum expenses
    expense_pipeline = [
        {
            "$match": {
                "user_id": {"$in": user_ids},
                "date": {
                    "$gte": datetime(current_year, 1, 1),
                    "$lt": datetime(current_year + 1, 1, 1)
                }
            }
        },
        {
            "$project": {
                "month": {"$month": "$date"},
                "amount": 1
            }
        },
        {
            "$group": {
                "_id": "$month",
                "totalExpenses": {"$sum": "$amount"}
            }
        }
    ]
    expense_aggregation = expenses_collection.aggregate(expense_pipeline)
    expenses = await expense_aggregation.to_list(length=None)
    expense_map = {str(doc["_id"]): doc["totalExpenses"] for doc in expenses}
    
    # 5. Tạo danh sách MonthlyData
    monthly_data = []
    for month in range(1, 13):
        month_str = str(month)
        total_budget = budget_map.get(month_str, 0.0)
        total_expenses = expense_map.get(month_str, 0.0)
        savings = total_budget - total_expenses
        monthly_data.append(MonthlyData(
            month=month_str,
            expenses=total_expenses,
            budget=total_budget,
            savings=savings
        ))
    
    return MonthlyDataResponse(monthlyData=monthly_data)