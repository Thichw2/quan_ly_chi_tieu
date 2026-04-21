import random
import string
from fastapi import APIRouter, HTTPException, status, Depends, Form
from jose import JWTError, jwt
from app.core.utils import get_current_user, oauth2_scheme, send_verify_email, send_reset_email # Import hàm gửi mail mới
from app.core.security import hash_password, verify_password, create_access_token
from app.db import users_collection, token_blacklist_collection
from app.models.user import User
from bson import ObjectId
from datetime import datetime, timedelta
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
    role: str = Form(...),          # Nhận: "admin" hoặc "member"
    specific_role: str = Form(...)  # Nhận: "father", "mother", "child", "other"
):
    # 1. Kiểm tra tài khoản tồn tại
    existing_user = await users_collection.find_one({
        "$or": [{"username": username}, {"email": email}]
    })
    if existing_user:
        detail = "Tên đăng nhập đã tồn tại" if existing_user["username"] == username else "Email đã tồn tại"
        raise HTTPException(status_code=400, detail=detail)

    # 2. Chuẩn bị dữ liệu lưu trữ
    otp_code = str(random.randint(100000, 999999))
    hashed_pwd = hash_password(password) # Giả định bạn đã có hàm hash_password
    
    user_dict = {
        "fullname": fullname,
        "username": username,
        "password": hashed_pwd,
        "email": email,
        "role": role,                 # Lưu quyền hệ thống
        "specific_role": specific_role, # Lưu vị trí trong gia đình
        "family_id": None,            # Sẽ cập nhật sau khi tạo gia đình
        "is_active": False,           # Chờ xác nhận OTP
        "otp_code": otp_code,
        "created_at": datetime.utcnow(),
        "notification_settings": {"email": True, "system": True}
    }

    # 3. Lưu vào MongoDB
    try:
        result = await users_collection.insert_one(user_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi cơ sở dữ liệu: {str(e)}")
    
    # 4. Gửi Email (Background Task)
    try:
        await send_verify_email(email, otp_code) # Giả định hàm gửi mail đã có
    except Exception as e:
        print(f"Gửi mail lỗi: {e}")
        return {
            "message": "Đăng ký thành công nhưng không gửi được mail. Vui lòng thử lại sau.",
            "user_id": str(result.inserted_id)
        }

    return {"message": "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP."}

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
        raise HTTPException(status_code=404, detail="Email không tồn tại trong hệ thống")
    
    # 1. Tạo token reset mật khẩu (hết hạn sau 15 phút)
    # Thêm action: reset_password để phân biệt với access_token thông thường
    token_data = {
        "sub": str(user["_id"]),
        "action": "reset_password",
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    reset_token = jwt.encode(token_data, settings.SECRET_KEY, algorithm="HS256")
    
    # 2. Tạo link reset (Trỏ về URL Frontend của bạn)
    # Giả sử frontend chạy ở localhost:5173
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    # 3. Gửi mail (Cần cập nhật hàm send_reset_email trong utils của bạn)
    try:
        # Bạn hãy tạo hàm này trong app.core.utils nhé
        await send_reset_email(email, reset_link)
    except Exception as e:
        print(f"Mail error: {e}")
        raise HTTPException(status_code=500, detail="Không thể gửi email lúc này.")
    
    return {"message": "Link đặt lại mật khẩu đã được gửi vào Email của bạn."}

@router.post("/reset-password")
async def reset_password_confirm(
    token: str = Form(...),
    new_password: str = Form(...)
):
    try:
        # 1. Giải mã và kiểm tra token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("action") != "reset_password":
            raise HTTPException(status_code=400, detail="Token không hợp lệ")
            
        user_id = payload.get("sub")
        
        # 2. Update mật khẩu mới
        hashed_pwd = hash_password(new_password)
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hashed_pwd}}
        )
        
        if result.modified_count == 0:
             raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

        return {"message": "Mật khẩu đã được cập nhật thành công."}
        
    except JWTError:
        raise HTTPException(status_code=400, detail="Link đã hết hạn hoặc không hợp lệ.")