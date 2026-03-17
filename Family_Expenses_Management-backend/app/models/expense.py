# app/models/expense.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime  # Thay đổi từ date sang datetime

class Expense(BaseModel):
    id: str = Field(alias="_id")
    category_id: str
    user_id: str
    amount: float
    date: datetime  # Sử dụng datetime.datetime
    description: Optional[str]

    class Config:
        from_attributes = True
        populate_by_name = True  # Đã thay thế từ 'allow_population_by_field_name'
