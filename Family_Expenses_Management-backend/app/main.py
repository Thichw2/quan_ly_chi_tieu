# app/main.py
import sys
from pathlib import Path

# Thêm thư mục gốc của dự án vào sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from app.routers import (
    auth_router,
    family_router,
    user_management_router,
    expense_category_router,
    expense_router,
    budget_router,
    budget_request_router
)
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app = FastAPI(
    title="Family Expense Manager",
    description="API để quản lý chi tiêu trong gia đình 3 thế hệ, dữ liệu gửi lên là Form Data và yêu cầu accessToken",
    version="1.0.0",
)

origins = [
    "http://localhost",
    "http://localhost:5173",  
    "http://localhost:4173",  
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Hoặc ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(auth_router)
app.include_router(family_router)
app.include_router(user_management_router)
app.include_router(expense_category_router)
app.include_router(expense_router)
app.include_router(budget_router)  
app.include_router(budget_request_router)         

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
