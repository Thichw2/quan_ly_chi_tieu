import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from app.routers import auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.db.client import init_db_indexes, client
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app = FastAPI(
    title="Family Expense Manager",
    description="API quản lý chi tiêu gia đình",
    version="1.0.0",
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Cần khớp với port React của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.include_router(auth_router)

@app.on_event("startup")
async def startup_event():
    await init_db_indexes()
    print("✅ Database đã sẵn sàng")

@app.on_event("shutdown")
async def shutdown_event():
    client.close()
    print("✅ Đã đóng kết nối Database")