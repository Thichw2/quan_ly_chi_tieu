# app/routers/budget.py
from fastapi import APIRouter, HTTPException, status, Depends, Form
from bson import ObjectId
from typing import List, Optional
from app.core.utils import get_current_user, check_role
from app.db import budgets_collection,  expense_categories_collection, users_collection, expenses_collection
from app.models.user import User
from app.schemas.budget import BudgetOut

router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"],
)

@router.post("/", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
async def create_budget(
    category_id: str = Form(...),
    amount: float = Form(...),
    month: int = Form(...),
    year: int = Form(...),
    user_id: str = Form(...),  # Thêm trường để chỉ định thành viên
    current_user: User = Depends(get_current_user)
):
    """
    Tạo ngân sách mới cho danh mục chi tiêu. 
    Chỉ admin mới có quyền tạo ngân sách và có thể tạo cho thành viên trong gia đình.
    """
    # Kiểm tra quyền admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create budgets.")

    # Kiểm tra danh mục có tồn tại không
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID format.")
    category = await expense_categories_collection.find_one({"_id": ObjectId(category_id), "family_id": current_user.family_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    # Kiểm tra thành viên có tồn tại trong gia đình không
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format.")
    user = await users_collection.find_one({"_id": ObjectId(user_id), "family_id": current_user.family_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found in the family.")

    # Kiểm tra xem ngân sách đã tồn tại chưa
    existing_budget = await budgets_collection.find_one({
        "category_id": category_id,
        "family_id": current_user.family_id,
        "user_id": user_id,
        "month": month,
        "year": year
    })
    if existing_budget:
        raise HTTPException(status_code=400, detail="Budget for this category and user already exists for the specified month and year.")

    # Tạo dictionary ngân sách mới
    budget_data = {
        "category_id": category_id,
        "family_id": str(current_user.family_id),
        "user_id": user_id,
        "amount": amount,
        "month": month,
        "year": year,
    }

    # Thêm ngân sách vào cơ sở dữ liệu
    result = await budgets_collection.insert_one(budget_data)
    new_budget = await budgets_collection.find_one({"_id": result.inserted_id})

    # Bổ sung các trường `category_name` và `fullname` vào dữ liệu trả về
    new_budget["_id"] = str(new_budget["_id"])
    new_budget["category_name"] = category.get("name", "Unknown Category")
    new_budget["fullname"] = user.get("fullname", "Unknown User")

    return BudgetOut(**new_budget)



@router.get("/", response_model=List[BudgetOut])
async def get_budgets(current_user: User = Depends(get_current_user)):
    """
    Lấy danh sách ngân sách của gia đình, bao gồm tên danh mục và tên người dùng (nếu có).
    """
    query = {"family_id": current_user.family_id}
    budgets = []

    async for b in budgets_collection.find(query):
        b["_id"] = str(b["_id"])

        # Lấy tên danh mục
        category = await expense_categories_collection.find_one({"_id": ObjectId(b["category_id"])})
        if category:
            b["category_name"] = category.get("name", "Unknown")
        else:
            b["category_name"] = "Unknown"

        # Lấy tên người dùng (nếu có user_id)
        if b.get("user_id"):
            user = await users_collection.find_one({"_id": ObjectId(b["user_id"])})
            if user:
                b["fullname"] = user.get("fullname", "Unknown")
            else:
                b["fullname"] = "Unknown"
        else:
            b["fullname"] = None

        budgets.append(BudgetOut(**b))

    return budgets


@router.get("/{budget_id}", response_model=BudgetOut)
async def get_budget(budget_id: str, current_user: User = Depends(get_current_user)):
    """
    Lấy thông tin chi tiết ngân sách theo ID.
    """
    bdoc = await budgets_collection.find_one({"_id": ObjectId(budget_id), "family_id": current_user.family_id})
    if not bdoc:
        raise HTTPException(status_code=404, detail="Budget not found.")

    # Lấy thông tin tên danh mục
    category = await expense_categories_collection.find_one({"_id": ObjectId(bdoc["category_id"])})
    category_name = category["name"] if category else "Unknown Category"

    # Lấy thông tin người dùng
    user = await users_collection.find_one({"_id": ObjectId(bdoc["user_id"])})
    fullname = user["fullname"] if user else "Unknown User"

    bdoc["_id"] = str(bdoc["_id"])
    bdoc["category_name"] = category_name
    bdoc["fullname"] = fullname

    return BudgetOut(**bdoc)


@router.put("/{budget_id}", response_model=BudgetOut)
async def update_budget(
    budget_id: str,
    user_id: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    month: Optional[int] = Form(None),
    year: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Cập nhật thông tin ngân sách.
    Chỉ admin mới được phép cập nhật.
    """
    # Kiểm tra quyền admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update budgets.")

    # Kiểm tra ngân sách có tồn tại không
    bdoc = await budgets_collection.find_one({"_id": ObjectId(budget_id), "family_id": current_user.family_id})
    if not bdoc:
        raise HTTPException(status_code=404, detail="Budget not found.")

    update_data = {}

    # Kiểm tra và cập nhật user_id
    if user_id:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format.")
        user = await users_collection.find_one({"_id": ObjectId(user_id), "family_id": current_user.family_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found in the family.")
        update_data["user_id"] = user_id

    # Kiểm tra và cập nhật category_id
    if category_id:
        if not ObjectId.is_valid(category_id):
            raise HTTPException(status_code=400, detail="Invalid category ID format.")
        category = await expense_categories_collection.find_one({"_id": ObjectId(category_id), "family_id": current_user.family_id})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found.")
        update_data["category_id"] = category_id

    # Kiểm tra và cập nhật amount
    if amount is not None:
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0.")
        update_data["amount"] = amount

    # Kiểm tra và cập nhật month
    if month is not None:
        if not (1 <= month <= 12):
            raise HTTPException(status_code=400, detail="Invalid month value.")
        update_data["month"] = month

    # Kiểm tra và cập nhật year
    if year is not None:
        if year < 2000:
            raise HTTPException(status_code=400, detail="Year must be greater than 2000.")
        update_data["year"] = year

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")

    # Kiểm tra trùng lặp ngân sách
    query = {
        "family_id": current_user.family_id,
        "month": update_data.get("month", bdoc["month"]),
        "year": update_data.get("year", bdoc["year"]),
        "_id": {"$ne": ObjectId(budget_id)}
    }
    if "user_id" in update_data:
        query["user_id"] = update_data["user_id"]
    if "category_id" in update_data:
        query["category_id"] = update_data["category_id"]

    dup = await budgets_collection.find_one(query)
    if dup:
        raise HTTPException(status_code=400, detail="Another budget with this criteria already exists.")

    # Cập nhật ngân sách
    result = await budgets_collection.update_one({"_id": ObjectId(budget_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Budget update failed.")

    # Lấy thông tin ngân sách sau khi cập nhật
    updated_budget = await budgets_collection.find_one({"_id": ObjectId(budget_id)})

    # Lấy thông tin bổ sung: category_name và fullname
    category = await expense_categories_collection.find_one({"_id": ObjectId(updated_budget["category_id"])})
    updated_budget["category_name"] = category["name"] if category else "Unknown Category"

    user = await users_collection.find_one({"_id": ObjectId(updated_budget["user_id"])})
    updated_budget["fullname"] = user["fullname"] if user else "Unknown User"

    updated_budget["_id"] = str(updated_budget["_id"])

    return BudgetOut(**updated_budget)



@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(budget_id: str, current_user: User = Depends(get_current_user)):
    # Kiểm tra quyền admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create budgets.")
    # Kiểm tra sự tồn tại của budget trong gia đình người dùng
    bdoc = await budgets_collection.find_one({"_id": ObjectId(budget_id), "family_id": current_user.family_id})
    if not bdoc:
        raise HTTPException(status_code=404, detail="Budget not found.")
    
    # Kiểm tra nếu có bất kỳ bản ghi nào trong bảng expenses chứa budget_id
    expense_exists = await expenses_collection.find_one({"budget_id": budget_id})
    if expense_exists:
        raise HTTPException(status_code=400, detail="Budget này đã có expense, không thể xóa.")
    
    # Xóa budget nếu không có expense nào liên quan
    result = await budgets_collection.delete_one({"_id": ObjectId(budget_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Budget deletion failed")
    
    return

