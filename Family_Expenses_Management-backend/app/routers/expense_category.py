# app/routers/expense_category.py
from fastapi import APIRouter, HTTPException, status, Depends, Form
from typing import List
from bson import ObjectId
from app.core.utils import get_current_user
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền tạo danh mục.")
    
    # Chuẩn hóa tên (xóa khoảng trắng thừa)
    clean_name = name.strip()
    
    existing = await expense_categories_collection.find_one({
        "name": clean_name, 
        "family_id": current_user.family_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Danh mục này đã tồn tại trong gia đình.")
    
    cat_dict = {
        "name": clean_name,
        "family_id": current_user.family_id
    }
    result = await expense_categories_collection.insert_one(cat_dict)
    
    return {**cat_dict, "_id": str(result.inserted_id)}

@router.get("/", response_model=List[ExpenseCategoryOut])
async def get_expense_categories(current_user: User = Depends(get_current_user)):
    # Tự động lọc theo family_id của người đang đăng nhập
    cursor = expense_categories_collection.find({"family_id": current_user.family_id})
    cats = []
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền sửa danh mục.")

    clean_name = name.strip()
    
    # Kiểm tra trùng tên với danh mục khác
    dup = await expense_categories_collection.find_one({
        "name": clean_name,
        "family_id": current_user.family_id,
        "_id": {"$ne": ObjectId(category_id)}
    })
    if dup:
        raise HTTPException(status_code=400, detail="Tên danh mục này đã được sử dụng.")

    updated_cat = await expense_categories_collection.find_one_and_update(
        {"_id": ObjectId(category_id), "family_id": current_user.family_id},
        {"$set": {"name": clean_name}},
        return_document=True
    )
    
    if not updated_cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")

    updated_cat["_id"] = str(updated_cat["_id"])
    return ExpenseCategoryOut(**updated_cat)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense_category(
    category_id: str, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền xóa.")

    # 1. Kiểm tra ràng buộc ngân sách
    budget_exists = await budgets_collection.find_one({"category_id": category_id})
    if budget_exists:
        raise HTTPException(status_code=400, detail="Danh mục này đang có ngân sách, không thể xóa.")
    
    # 2. Kiểm tra ràng buộc chi tiêu
    expense_exists = await expenses_collection.find_one({"category_id": category_id})
    if expense_exists:
        raise HTTPException(status_code=400, detail="Danh mục này đang có dữ liệu chi tiêu, không thể xóa.")

    result = await expense_categories_collection.delete_one({
        "_id": ObjectId(category_id), 
        "family_id": current_user.family_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
    
    return None # Trả về None cho 204 No Content