# app/models/budget_request.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BudgetRequest(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    requested_amount: float
    current_budget: float
    status: str  # 'pending', 'approved', 'denied'
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True  # Thay thế từ 'allow_population_by_field_name'
