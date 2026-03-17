from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BudgetRequestCreate(BaseModel):
    category_id: str
    month: int
    year: int
    requested_amount: float

class BudgetRequestOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str]  # Thêm trường category_name
    fullname: Optional[str]       # Thêm trường fullname
    month: int
    year: int
    requested_amount: float
    current_budget: float
    status: str  # 'pending', 'approved', 'denied'
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        populate_by_name = True
