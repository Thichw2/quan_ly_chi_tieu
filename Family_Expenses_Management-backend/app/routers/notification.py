# app/routers/notification.py
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from typing import List
from datetime import datetime

from app.core.utils import get_current_user
from app.models.user import User
from app.db import notifications_collection
from app.schemas.notification import NotificationOut

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


async def create_notification(user_id: str, title: str, message: str, ntype: str, related_id: str = None):
    """Helper để tạo thông báo trong DB."""
    doc = {
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": ntype,
        "is_read": False,
        "created_at": datetime.utcnow(),
        "related_id": related_id,
    }
    await notifications_collection.insert_one(doc)


@router.get("/", response_model=List[NotificationOut])
async def get_notifications(current_user: User = Depends(get_current_user)):
    """Lấy danh sách thông báo của người dùng hiện tại (mới nhất trước)."""
    notifications = []
    cursor = notifications_collection.find(
        {"user_id": str(current_user.id)}
    ).sort("created_at", -1).limit(50)

    async for n in cursor:
        n["_id"] = str(n["_id"])
        notifications.append(NotificationOut(**n))

    return notifications


@router.get("/unread-count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    """Đếm số thông báo chưa đọc."""
    count = await notifications_collection.count_documents({
        "user_id": str(current_user.id),
        "is_read": False
    })
    return {"count": count}


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Đánh dấu thông báo đã đọc."""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID.")

    result = await notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "user_id": str(current_user.id)},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found.")

    return {"message": "Đã đánh dấu đọc"}


@router.put("/read-all")
async def mark_all_as_read(current_user: User = Depends(get_current_user)):
    """Đánh dấu tất cả thông báo đã đọc."""
    await notifications_collection.update_many(
        {"user_id": str(current_user.id), "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "Đã đánh dấu tất cả đã đọc"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(notification_id: str, current_user: User = Depends(get_current_user)):
    """Xóa một thông báo."""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID.")

    result = await notifications_collection.delete_one(
        {"_id": ObjectId(notification_id), "user_id": str(current_user.id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return
