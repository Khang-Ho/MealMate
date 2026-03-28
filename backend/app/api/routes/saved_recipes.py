"""Wishlist / saved recipes backed by Supabase saved_recipes table."""
from fastapi import APIRouter, HTTPException, Query

from app.schemas.saved_recipe import SavedRecipeCreate, SavedRecipeRow, SavedRecipesListResponse
from app.services import saved_recipes_service

router = APIRouter(prefix="/saved-recipes", tags=["saved-recipes"])


@router.get("", response_model=SavedRecipesListResponse)
async def list_saved_recipes(user_id: str = Query(..., min_length=1, description="Clerk user id")):
    if not saved_recipes_service.is_configured():
        raise HTTPException(
            status_code=503,
            detail="Supabase is not configured on the server (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)",
        )
    try:
        rows = await saved_recipes_service.list_for_user(user_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc

    recipes = [
        SavedRecipeRow(
            id=str(r["id"]),
            user_id=r["user_id"],
            spoonacular_id=r["spoonacular_id"],
            title=r["title"],
            image=r.get("image"),
            ready_minutes=r.get("ready_minutes"),
            servings=r.get("servings"),
        )
        for r in rows
    ]
    return SavedRecipesListResponse(recipes=recipes)


@router.post("", response_model=SavedRecipeRow)
async def save_recipe(body: SavedRecipeCreate):
    if not saved_recipes_service.is_configured():
        raise HTTPException(status_code=503, detail="Supabase is not configured on the server")
    try:
        row = await saved_recipes_service.insert(
            body.user_id,
            body.spoonacular_id,
            body.title,
            body.image,
            body.ready_minutes,
            body.servings,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not row:
        raise HTTPException(status_code=500, detail="No row returned from database")
    return SavedRecipeRow(
        id=str(row["id"]),
        user_id=row["user_id"],
        spoonacular_id=row["spoonacular_id"],
        title=row["title"],
        image=row.get("image"),
        ready_minutes=row.get("ready_minutes"),
        servings=row.get("servings"),
    )


@router.delete("/{spoonacular_id}")
async def remove_saved_recipe(
    spoonacular_id: int,
    user_id: str = Query(..., min_length=1),
):
    if not saved_recipes_service.is_configured():
        raise HTTPException(status_code=503, detail="Supabase is not configured on the server")
    try:
        await saved_recipes_service.delete_one(user_id, spoonacular_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"ok": True}
