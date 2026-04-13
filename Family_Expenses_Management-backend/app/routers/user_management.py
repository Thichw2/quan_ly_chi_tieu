# app/routers/user_management.py
from fastapi import APIRouter, HTTPException, status, Depends, Form, BackgroundTasks
from bson import ObjectId
from app.core.security import hash_password
from app.core.utils import get_current_user, check_role
from app.models.user import User
from app.db import users_collection, families_collection, db
from typing import List
from datetime import datetime
from app.schemas.user import UserOut
import secrets
router = APIRouter(
    prefix="/users",
    tags=["User Management"],
)
@router.post("/accept-invite")
async def accept_invite(
    token: str = Form(...),
    current_user: User = Depends(get_current_user) # Người đang bấm nút
):
    # 1. Tìm thông tin mời
    invitation = await db.invitations.find_one({"token": token})
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Lời mời không tồn tại hoặc đã được sử dụng.")

    # 2. KIỂM TRA QUAN TRỌNG: Email người đăng nhập phải khớp với email được mời
    if current_user.email != invitation["email"]:
        raise HTTPException(
            status_code=403, 
            detail="Lời mời này không dành cho tài khoản đang đăng nhập."
        )

    family_id = invitation["family_id"]
    new_role = invitation.get("role", "member")

    # 3. Cập nhật cho NGƯỜI ĐƯỢC MỜI (current_user)
    await db.users.update_one(
        {"_id": ObjectId(str(current_user.id))},
        {"$set": {
            "family_id": family_id,
            "role": new_role
        }}
    )

    # 4. Thêm vào danh sách thành viên của Gia đình
    await db.families.update_one(
        {"_id": ObjectId(str(family_id))},
        {"$addToSet": {"members": str(current_user.id)}}
    )

    # 5. Xóa hoặc cập nhật trạng thái lời mời
    await db.invitations.delete_one({"_id": invitation["_id"]})

    return {"status": "success", "message": "Bạn đã tham gia gia đình thành công!"}
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
        "is_active": True,           # THÊM DÒNG NÀY
        "created_at": datetime.now(), # THÊM DÒNG NÀY
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
@router.post("/invite_only")
async def invite_member_via_email(
    email: str = Form(...),
    role: str = Form("member"),
    current_user: User = Depends(check_role("admin"))
):
    # 1. Kiểm tra Admin đã có gia đình chưa
    if not current_user.family_id:
        raise HTTPException(status_code=400, detail="Bạn cần tạo gia đình trước khi mời thành viên.")

    # 2. Kiểm tra xem người này đã có gia đình khác chưa
    target_user = await db.users.find_one({"email": email})
    if target_user and target_user.get("family_id"):
        raise HTTPException(
            status_code=400, 
            detail=f"Email {email} đã thuộc về một gia đình khác."
        )

    # 3. XỬ LÝ GỬI LẠI (Sửa lỗi bạn gặp): 
    # Nếu có lời mời cũ đang pending, xóa nó đi để gửi cái mới thay thế
    await db.invitations.delete_many({
        "email": email,
        "family_id": current_user.family_id,
        "status": "pending"
    })

    # 4. Tạo Token và nội dung mail
    invite_token = secrets.token_urlsafe(32)
    invite_link = f"http://localhost:5173/accept-invite?token={invite_token}"
    
    email_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h3 style="color: #2563eb;">Lời mời gia nhập gia đình</h3>
        <p>Chào bạn, <b>{current_user.username}</b> đã mời bạn vào gia đình của họ.</p>
        <a href="{invite_link}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Chấp nhận lời mời</a>
    </div>
    """

    # 5. GỬI MAIL TRƯỚC (Để kiểm tra lỗi SMTP)
    try:
        from app.core.utils import send_email
        # Await trực tiếp ở đây để nếu sai cấu hình mail là biết ngay
        await send_email(email, "Lời mời gia nhập gia đình", email_content)
    except Exception as e:
        # Nếu gửi mail thất bại (sai pass app, sai server mail...)
        print(f"SMTP Error: {e}")
        raise HTTPException(status_code=500, detail="Hệ thống không thể gửi email. Vui lòng kiểm tra cấu hình SMTP.")

    # 6. Gửi mail xong xuôi mới lưu vào Database
    invitation_data = {
        "email": email,
        "family_id": current_user.family_id,
        "role": role,
        "token": invite_token,
        "invited_by": str(current_user.id),
        "created_at": datetime.now(),
        "status": "pending"
    }
    
    await db.invitations.insert_one(invitation_data)

    return {
        "status": "success",
        "message": f"Đã gửi email mời tới {email}!"
    }

@router.post("/add_members_direct")
async def add_members_direct(
    fullname: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(check_role("admin"))
):
    """
    Cách 2: Tạo User trực tiếp nhưng ở trạng thái chờ xác nhận (is_active=False).
    """
    # Kiểm tra trùng lặp
    existing_user = await users_collection.find_one({"$or": [{"username": username}, {"email": email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username hoặc Email đã tồn tại")

    # Tạo token xác thực
    verification_token = secrets.token_urlsafe(32)
    
    hashed_pwd = hash_password(password)
    user_dict = {
        "fullname": fullname,
        "username": username,
        "password": hashed_pwd,
        "email": email,
        "role": role,
        "family_id": current_user.family_id,
        "is_active": False, # Chưa được hoạt động cho đến khi xác thực mail
        "verification_token": verification_token,
        "created_at": datetime.now()
    }
    
    result = await users_collection.insert_one(user_dict)
    
    # Gửi mail xác thực
    verify_link = f"http://localhost:5173/verify-account?token={verification_token}"
    background_tasks.add_task(
        send_email, 
        email, 
        "Xác thực tài khoản của bạn", 
        f"Chào {fullname}, vui lòng xác thực tài khoản tại: {verify_link}"
    )

    return {"message": "Tạo user thành công. Vui lòng kiểm tra email để kích hoạt tài khoản."}
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
@router.delete("/{user_id}")
async def remove_member_from_family(
    user_id: str, 
    current_user: User = Depends(check_role("admin"))
):
    """Gỡ thành viên khỏi gia đình (không xóa tài khoản)"""
    
    # 1. Tìm người dùng cần gỡ
    target_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not target_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    # 2. Kiểm tra xem người bị gỡ có thuộc gia đình của admin này không
    # Dùng str() để so sánh chính xác hai ObjectId
    if str(target_user.get("family_id")) != str(current_user.family_id):
        raise HTTPException(status_code=403, detail="Người này không thuộc gia đình của bạn")

    # 3. Cập nhật User: Set family_id thành None (Gỡ liên kết)
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"family_id": None, "role": "user"}} # Reset role về mặc định nếu cần
    )
    
    # 4. Cập nhật Collection Families: Xóa user_id khỏi mảng members
    await families_collection.update_one(
        {"_id": ObjectId(current_user.family_id)},
        {"$pull": {"members": user_id}}
    )

    return {"message": "Đã gỡ thành viên khỏi gia đình thành công"}

    