# app/routers/family.py
from fastapi import APIRouter, HTTPException, status, Depends, Form
from bson import ObjectId
from app.core.utils import get_current_user, check_role
from app.db import families_collection, users_collection
from app.models.user import User
from app.schemas.family import FamilyOut

router = APIRouter(
    prefix="/family",
    tags=["Family"],
)

@router.post("/create", response_model=FamilyOut)
async def create_family(
    name: str = Form(...),
    current_user: User = Depends(check_role("admin"))
):
    if current_user.family_id:
        raise HTTPException(status_code=400, detail="Admin already belongs to a family")

    new_family = {
        "name": name,
        "members": [str(current_user.id)]
    }
    result = await families_collection.insert_one(new_family)
    family_id = result.inserted_id  # ObjectId

    # Convert family_id to string
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},  # convert current_user.id -> ObjectId
        {"$set": {"family_id": str(family_id)}}
    )

    return FamilyOut(
        id=str(family_id),
        name=name,
        members=[str(current_user.id)]
    )


