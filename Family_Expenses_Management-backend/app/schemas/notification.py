# app/schemas/notification.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationOut(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    title: str
    message: str
    type: str  # "expense_added", "budget_exceeded", "budget_approved", "budget_denied", "budget_request"
    is_read: bool = False
    created_at: datetime
    related_id: Optional[str] = None  # ID liên quan (expense_id, budget_id...)

    class Config:
        populate_by_name = True
