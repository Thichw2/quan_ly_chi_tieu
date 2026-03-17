# app/routers/user_management.py
from fastapi import APIRouter, HTTPException, status, Depends, Form
from bson import ObjectId
from app.core.security import hash_password
from app.core.utils import get_current_user, check_role
from app.models.user import User
from app.db import users_collection, families_collection
from typing import List

from app.schemas.user import UserOut

router = APIRouter(
    prefix="/users",
    tags=["User Management"],
)

@router.post("/add_members")
async def add_members(
    fullname: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    specific_role: str = Form(...),
    current_user: User = Depends(check_role("admin"))
):
    if not current_user.family_id:
        raise HTTPException(status_code=400, detail="Admin does not belong to any family")

    existing_user = await users_collection.find_one({"$or": [{"username": username}, {"email": email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    hashed_pwd = hash_password(password)
    user_dict = {
        "fullname": fullname,
        "username": username,
        "password": hashed_pwd,
        "email": email,
        "role": role,
        "specific_role": specific_role,
        "family_id": current_user.family_id,
        "notification_settings": {
            "email": True,
            "system": True
        }
    }
    result = await users_collection.insert_one(user_dict)
    new_user = await users_collection.find_one({"_id": result.inserted_id})
    await families_collection.update_one(
        {"_id": ObjectId(current_user.family_id)},  # convert current_user.id -> ObjectId
        {"$push": {"members": str(result.inserted_id)}}
    )

    if not new_user:
        raise HTTPException(status_code=500, detail="User creation failed")

    new_user["_id"] = str(new_user["_id"])
    return {
        "id": new_user["_id"],
        "fullname": new_user["fullname"],
        "username": new_user["username"],
        "email": new_user["email"],
        "role": new_user["role"],
        "specific_role": new_user.get("specific_role"),
        "family_id": new_user.get("family_id"),
        "notification_settings": new_user.get("notification_settings", {"email": True, "system": True})
    }

@router.get("/family", response_model=List[UserOut])
async def get_all_users_in_family(current_user: User = Depends(get_current_user)):
    """
    Lấy thông tin toàn bộ user trong cùng một family.
    """
    if not current_user.family_id:
        # Trường hợp user chưa thuộc gia đình nào
        raise HTTPException(
            status_code=400,
            detail="Bạn chưa có family_id, hãy tham gia một gia đình trước."
        )

    # Tìm tất cả user có cùng family_id
    family_users_cursor = users_collection.find({"family_id": current_user.family_id})
    family_users = []
    async for user_doc in family_users_cursor:
        user_doc["_id"] = str(user_doc["_id"])
        family_users.append(UserOut(**user_doc))

    return family_users
