import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.db.client import init_db_indexes, client

# 1. Import các router của bạn tại đây
from app.routers import auth_router
from app.routers.family import router as family_router                   # Thêm dòng này
from app.routers.expense_category import router as expense_category_router # Thêm dòng này
from app.routers.user_management import router as user_management_router # Thêm dòng này
app = FastAPI(
    title="Family Expense Manager",
    description="API quản lý chi tiêu gia đình",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. Đăng ký (include) các router vào app
app.include_router(auth_router)
app.include_router(family_router)                   # Thêm dòng này
app.include_router(expense_category_router)         # Thêm dòng này
app.include_router(user_management_router)          # Thêm dòng này
@app.on_event("startup")
async def startup_event():
    await init_db_indexes()
    print("✅ Database đã sẵn sàng")

@app.on_event("shutdown")
async def shutdown_event():
    client.close()
    print("✅ Đã đóng kết nối Database")