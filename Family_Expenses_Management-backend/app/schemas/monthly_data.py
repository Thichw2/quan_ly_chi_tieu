# app/schemas/monthly_data.py

from pydantic import BaseModel
from typing import List

class MonthlyData(BaseModel):
    month: str        # Dạng chuỗi từ '1' đến '12'
    expenses: float
    budget: float
    savings: float

class MonthlyDataResponse(BaseModel):
    monthlyData: List[MonthlyData]

    class Config:
        orm_mode = True
        populate_by_name = True
