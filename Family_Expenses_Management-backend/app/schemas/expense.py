from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta

class ExpenseOut(BaseModel):
    id: str = Field(alias="_id")  # ID của expense
    category_id: str  # ID của danh mục
    category_name: Optional[str]  # Tên danh mục
    user_id: str  # ID của người dùng
    fullname: Optional[str]  # Tên người dùng
    amount: float
    date: datetime  # Ngày tháng
    description: Optional[str] = None  # Ghi chú khoản chi

    class Config:
        orm_mode = True
        populate_by_name = True
