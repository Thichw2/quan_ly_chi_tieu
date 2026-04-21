# app/routers/expense_category.py
from fastapi import APIRouter, HTTPException, status, Depends, Form
from typing import List
from bson import ObjectId
from app.core.utils import get_current_user, check_role
from app.db import expense_categories_collection, expenses_collection, budgets_collection
from app.models.user import User
from app.schemas.expense_category import ExpenseCategoryOut

router = APIRouter(
    prefix="/expense-categories",
    tags=["Expense Categories"],
)

@router.post("/", response_model=ExpenseCategoryOut, status_code=status.HTTP_201_CREATED)
async def create_expense_category(
    name: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create category.")
    existing_category = await expense_categories_collection.find_one({"name": name, "family_id": current_user.family_id})
    if existing_category:
        raise HTTPException(status_code=400, detail="Expense category already exists in your family.")
    
    cat_dict = {
        "name": name,
        "family_id": current_user.family_id
    }
    result = await expense_categories_collection.insert_one(cat_dict)
    new_cat = await expense_categories_collection.find_one({"_id": result.inserted_id})
    if not new_cat:
        raise HTTPException(status_code=500, detail="Category creation failed")
    
    new_cat["_id"] = str(new_cat["_id"])
    return ExpenseCategoryOut(**new_cat)

@router.get("/", response_model=List[ExpenseCategoryOut])
async def get_expense_categories(current_user: User = Depends(get_current_user)):
    cats = []
    cursor = expense_categories_collection.find({"family_id": current_user.family_id})
    async for cat in cursor:
        cat["_id"] = str(cat["_id"])
        cats.append(ExpenseCategoryOut(**cat))
    return cats

@router.put("/{category_id}", response_model=ExpenseCategoryOut)
async def update_expense_category(
    category_id: str,
    name: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """
    Cập nhật thông tin danh mục chi tiêu.
    """
    # Kiểm tra quyền admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update budgets.")
    # Kiểm tra danh mục có tồn tại không
    try:
        existing_category = await expense_categories_collection.find_one(
            {"_id": ObjectId(category_id), "family_id": current_user.family_id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found.")

    # Kiểm tra trùng tên danh mục
    try:
        dup = await expense_categories_collection.find_one({
            "name": name,
            "family_id": current_user.family_id,
            "_id": {"$ne": ObjectId(category_id)}
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    if dup:
        raise HTTPException(status_code=400, detail="Another category with this name already exists.")

    # Cập nhật danh mục
    try:
        result = await expense_categories_collection.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": {"name": name}}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    # Kiểm tra nếu không có thay đổi
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found.")
    if result.modified_count == 0:
        # Nếu giá trị giống nhau, vẫn coi là thành công
        updated_cat = existing_category
    else:
        # Lấy danh mục đã cập nhật
        updated_cat = await expense_categories_collection.find_one({"_id": ObjectId(category_id)})

    # Chuyển đổi `_id` sang string để trả về
    updated_cat["_id"] = str(updated_cat["_id"])
    return ExpenseCategoryOut(**updated_cat)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense_category(category_id: str, current_user: User = Depends(get_current_user)):
    # Kiểm tra quyền admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can delete budgets.")
    existing_category = await expense_categories_collection.find_one({"_id": ObjectId(category_id), "family_id": current_user.family_id})
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found.")
    
    # Kiểm tra nếu có bất kỳ record nào trong bảng budgets chứa category_id
    budget_exists = await budgets_collection.find_one({"category_id": category_id, "family_id": current_user.family_id})
    if budget_exists:
        raise HTTPException(status_code=400, detail="This category already has a budget and cannot be deleted.")
    
    # Kiểm tra nếu có bất kỳ record nào trong bảng expenses chứa category_id
    expense_exists = await expenses_collection.find_one({"category_id": category_id})
    if expense_exists:
        raise HTTPException(status_code=400, detail="This category already has an expense and cannot be deleted.")
    
    # Nếu không có bất kỳ record nào trong bảng budgets và expenses, cho phép xóa
    result = await expense_categories_collection.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Category deletion failed")
    
    return
