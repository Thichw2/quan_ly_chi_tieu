import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.db.client import init_db_indexes, client

# 1. Import cac router
from app.routers import auth_router
from app.routers.family import router as family_router
from app.routers.expense_category import router as expense_category_router
from app.routers.expense import router as expense_router
from app.routers.user_management import router as user_management_router
from app.routers.budget import router as budget_router
from app.routers.budget_request import router as budget_request_router
from app.routers.notification import router as notification_router

app = FastAPI(
    title="Family Expense Manager",
    description="API quan ly chi tieu gia dinh",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. Dang ky cac router vao app
app.include_router(auth_router)
app.include_router(family_router)
app.include_router(expense_category_router)
app.include_router(expense_router)
app.include_router(user_management_router)
app.include_router(budget_router)
app.include_router(budget_request_router)
app.include_router(notification_router)

@app.on_event("startup")
async def startup_event():
    await init_db_indexes()
    print("[OK] Database da san sang")

@app.on_event("shutdown")
async def shutdown_event():
    client.close()
    print("[OK] Da dong ket noi Database")