# app/routers/auth.py
import random
import string
from fastapi import APIRouter, HTTPException, status, Depends, Form
from jose import JWTError
import jwt
from pydantic import BaseModel
from app.core.utils import get_current_user, check_role, send_email
from app.core.security import hash_password, verify_password, create_access_token
from app.db import users_collection, token_blacklist_collection
from app.models.user import User
from bson import ObjectId
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.utils import oauth2_scheme

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)



@router.post("/register")
async def register(
    fullname: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    specific_role: str = Form(...)
):
    existing_user = await users_collection.find_one({"$or": [{"username": username}, {"email": email}]})
    if existing_user:
        if existing_user["username"] == username:
            raise HTTPException(status_code=400, detail="Username already exists")
        else:
            raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pwd = hash_password(password)
    user_dict = {
        "fullname": fullname,
        "username": username,
        "password": hashed_pwd,
        "email": email,
        "role": role,
        "specific_role": specific_role,
        "family_id": None,
        "notification_settings": {
            "email": True,
            "system": True
        }
    }

    result = await users_collection.insert_one(user_dict)
    new_user = await users_collection.find_one({"_id": result.inserted_id})

    if not new_user:
        raise HTTPException(status_code=500, detail="User creation failed")

    # convert _id -> str
    new_user["_id"] = str(new_user["_id"])

    return {
        "id": new_user["_id"],
        "username": new_user["username"],
        "email": new_user["email"],
        "role": new_user["role"],
        "specific_role": new_user.get("specific_role"),
        "family_id": new_user.get("family_id"),
        "notification_settings": new_user.get("notification_settings", {"email": True, "system": True})
    }

@router.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    db_user = await users_collection.find_one({"username": username})
    if not db_user or not verify_password(password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": str(db_user["_id"])})
    db_user.pop("password", None)
    db_user["_id"] = str(db_user["_id"])
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": db_user
        }


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(current_user: User = Depends(get_current_user), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti is None or exp is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    # Thêm jti vào blacklist
    await token_blacklist_collection.insert_one({
        "jti": jti,
        "expires": datetime.utcfromtimestamp(exp)
    })
    
    return {"message": "Successfully logged out"}

@router.post("/forget-password", status_code=status.HTTP_200_OK)
async def forget_password(email: str = Form(...)):
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User with this email does not exist")
    
    # Tạo mật khẩu mới ngẫu nhiên
    new_password = ''.join(random.choices(string.ascii_letters + string.digits + string.punctuation, k=12))
    
    # Băm mật khẩu mới
    hashed_password = hash_password(new_password)
    
    # Cập nhật mật khẩu trong database
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed_password}}
    )
    
    # Gửi email với mật khẩu mới
    subject = "Reset Password - Family Expense Manager"
    body = (
        f"Chào {user.get('username')},\n\n"
        f"Mật khẩu mới của bạn là: {new_password}\n"
        f"Vui lòng đăng nhập và thay đổi mật khẩu của bạn ngay lập tức.\n\n"
        f"Trân trọng,\nFamily Expense Manager Team"
    )
    send_email(email, subject, body)
    
    return {"message": "A new password has been sent to your email."}

@router.put("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    user_doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Kiểm tra mật khẩu hiện tại
    if not verify_password(current_password, user_doc["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # # Kiểm tra mật khẩu mới có hợp lệ không (ví dụ: độ dài, chứa ký tự đặc biệt, ...)
    # if len(new_password) < 8:
    #     raise HTTPException(status_code=400, detail="New password must be at least 8 characters long")
    
    # Băm mật khẩu mới
    hashed_password = hash_password(new_password)
    
    # Cập nhật mật khẩu trong database
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"password": hashed_password}}
    )
    
    # Gửi email thông báo đổi mật khẩu thành công
    subject = "Change Password Confirmation"
    body = (
        f"Chào {current_user.username},\n\n"
        f"Mật khẩu của bạn đã được thay đổi thành công.\n"
        f"Nếu bạn không thực hiện điều này, vui lòng liên hệ với chúng tôi ngay lập tức.\n\n"
        f"Trân trọng,\nFamily Expense Manager Team"
    )
    send_email(current_user.email, subject, body)
    
    return {"message": "Password updated successfully"}
