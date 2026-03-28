"""Cooked meal history backed by Supabase cooked_meals table."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services import cooked_meals_service

router = APIRouter(prefix="/cooked-meals", tags=["cooked-meals"])


class CookedMealRow(BaseModel):
    id: str
    user_id: str
    spoonacular_id: int
    title: str
    image: str | None = None
    cooked_at: str


class CookedMealsListResponse(BaseModel):
    meals: list[CookedMealRow]


class CookedMealCreate(BaseModel):
    user_id: str
    spoonacular_id: int
    title: str
    image: str | None = None


@router.get("", response_model=CookedMealsListResponse)
async def list_cooked_meals(
    user_id: str = Query(..., min_length=1, description="Clerk user id"),
    limit: int = Query(50, ge=1, le=200),
):
    if not cooked_meals_service.is_configured():
        raise HTTPException(status_code=503, detail="Supabase is not configured on the server")
    try:
        rows = await cooked_meals_service.list_for_user(user_id, limit)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc

    meals = [
        CookedMealRow(
            id=str(r["id"]),
            user_id=r["user_id"],
            spoonacular_id=r["spoonacular_id"],
            title=r["title"],
            image=r.get("image"),
            cooked_at=str(r.get("cooked_at", "")),
        )
        for r in rows
    ]
    return CookedMealsListResponse(meals=meals)


@router.post("", response_model=CookedMealRow)
async def add_cooked_meal(body: CookedMealCreate):
    if not cooked_meals_service.is_configured():
        raise HTTPException(status_code=503, detail="Supabase is not configured on the server")
    try:
        row = await cooked_meals_service.insert(
            body.user_id,
            body.spoonacular_id,
            body.title,
            body.image,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not row:
        raise HTTPException(status_code=500, detail="No row returned from database")
    return CookedMealRow(
        id=str(row["id"]),
        user_id=row["user_id"],
        spoonacular_id=row["spoonacular_id"],
        title=row["title"],
        image=row.get("image"),
        cooked_at=str(row.get("cooked_at", "")),
    )


@router.delete("/{row_id}")
async def remove_cooked_meal(
    row_id: str,
    user_id: str = Query(..., min_length=1),
):
    if not cooked_meals_service.is_configured():
        raise HTTPException(status_code=503, detail="Supabase is not configured on the server")
    try:
        await cooked_meals_service.delete_one(user_id, row_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"ok": True}
