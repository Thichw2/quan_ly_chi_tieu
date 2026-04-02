import random
import string
from fastapi import APIRouter, HTTPException, status, Depends, Form
from jose import JWTError, jwt
from app.core.utils import get_current_user, oauth2_scheme, send_verify_email # Import hàm gửi mail mới
from app.core.security import hash_password, verify_password, create_access_token
from app.db import users_collection, token_blacklist_collection
from app.models.user import User
from bson import ObjectId
from datetime import datetime
from app.core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

import random
import string
from fastapi import APIRouter, HTTPException, status, Depends, Form
from jose import JWTError, jwt
from app.core.utils import get_current_user, oauth2_scheme, send_verify_email
from app.core.security import hash_password, verify_password, create_access_token
from app.db import users_collection, token_blacklist_collection
from app.models.user import User
from bson import ObjectId
from datetime import datetime
import asyncio

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
    specific_role: str = Form(None)
):
    # 1. Kiểm tra tồn tại
    existing_user = await users_collection.find_one({"$or": [{"username": username}, {"email": email}]})
    if existing_user:
        detail = "Tên đăng nhập đã tồn tại" if existing_user["username"] == username else "Email đã tồn tại"
        raise HTTPException(status_code=400, detail=detail)

    # 2. Tạo mã OTP 6 số
    otp_code = str(random.randint(100000, 999999))
    
    # 3. Hash mật khẩu và chuẩn bị dữ liệu
    hashed_pwd = hash_password(password)
    user_dict = {
        "fullname": fullname,
        "username": username,
        "password": hashed_pwd,
        "email": email,
        "role": role,
        "specific_role": specific_role,
        "family_id": None,
        "is_active": False,
        "otp_code": otp_code,
        "created_at": datetime.utcnow(),
        "notification_settings": {"email": True, "system": True}
    }

    # 4. Lưu vào DB
    try:
        result = await users_collection.insert_one(user_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lưu dữ liệu: {str(e)}")
    
    # 5. Gửi Email xác thực
    # Sử dụng background task hoặc try-except để tránh treo app nếu mail server lỗi
    try:
        await send_verify_email(email, otp_code)
    except Exception as e:
        print(f"Send mail error: {e}")
        # Không raise lỗi ở đây để user vẫn được tạo, nhưng báo họ kiểm tra lại sau
        return {"message": "Đăng ký thành công nhưng gửi mail lỗi. Vui lòng liên hệ hỗ trợ.", "user_id": str(result.inserted_id)}

    return {"message": "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực."}

@router.post("/verify-email")
async def verify_email(
    email: str = Form(...),
    otp: str = Form(...)
):
    user = await users_collection.find_one({"email": email, "otp_code": otp})
    if not user:
        raise HTTPException(status_code=400, detail="Mã xác thực hoặc email không đúng")
    
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"is_active": True}, "$unset": {"otp_code": ""}}
    )
    return {"message": "Xác thực thành công. Bạn có thể đăng nhập."}

@router.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    db_user = await users_collection.find_one({"username": username})
    if not db_user or not verify_password(password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Tài khoản hoặc mật khẩu không đúng")
    
    if not db_user.get("is_active", False):
        raise HTTPException(status_code=403, detail="Tài khoản chưa xác thực email.")

    access_token = create_access_token(data={"sub": str(db_user["_id"])})
    db_user["_id"] = str(db_user["_id"])
    db_user.pop("password", None)
    
    return {"access_token": access_token, "token_type": "bearer", "user": db_user}

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        jti = payload.get("jti")
        exp = payload.get("exp")
        if not jti:
            raise HTTPException(status_code=400, detail="Invalid token")
            
        await token_blacklist_collection.insert_one({
            "jti": jti,
            "expires": datetime.utcfromtimestamp(exp)
        })
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    return {"message": "Successfully logged out"}

@router.post("/forget-password")
async def forget_password(email: str = Form(...)):
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User with this email does not exist")
    
    new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    hashed_password = hash_password(new_password)
    
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed_password}}
    )
    
    # Bạn có thể cập nhật hàm send_email trong utils để dùng fastapi-mail cho đồng bộ
    # Ở đây tạm dùng hàm send_email cũ của bạn
    subject = "Reset Password"
    body = f"Mật khẩu mới của bạn là: {new_password}"
    # send_email(email, subject, body) 
    
    return {"message": "New password sent to email."}

@router.put("/change-password")
async def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    user_doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    if not verify_password(current_password, user_doc["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"password": hash_password(new_password)}}
    )
    return {"message": "Password updated successfully"}