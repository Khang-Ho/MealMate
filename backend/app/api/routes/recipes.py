"""Recipe search and ingredient endpoints."""
from fastapi import APIRouter, HTTPException, Query

from app.schemas.recipe import (
    RecipeIngredient,
    RecipeIngredientsResponse,
    RecipeResult,
    RecipeSearchResponse,
)
from app.services import recipe_service

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("/search", response_model=RecipeSearchResponse)
async def search_recipes(
    q: str = Query(..., min_length=1, description="Recipe or ingredient query"),
    cuisine: str | None = Query(None, description="e.g. Italian, Asian, Mexican"),
    diet: str | None = Query(None, description="e.g. vegetarian, gluten free"),
    number: int = Query(12, ge=1, le=30),
):
    try:
        data = await recipe_service.search_recipes(q, cuisine, diet, number)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Spoonacular error: {exc}") from exc

    results = [
        RecipeResult(
            id=r["id"],
            title=r["title"],
            image=r.get("image"),
            ready_in_minutes=r.get("readyInMinutes"),
            servings=r.get("servings"),
            cuisines=r.get("cuisines", []),
            diets=r.get("diets", []),
            summary=r.get("summary"),
        )
        for r in data.get("results", [])
    ]
    return RecipeSearchResponse(
        results=results,
        total_results=data.get("totalResults", len(results)),
        query=q,
    )


@router.get("/{recipe_id}/ingredients", response_model=RecipeIngredientsResponse)
async def get_ingredients(recipe_id: int):
    try:
        data = await recipe_service.get_recipe_ingredients(recipe_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Spoonacular error: {exc}") from exc

    ingredients = [
        RecipeIngredient(
            id=ing.get("id"),
            name=ing.get("name", ""),
            original=ing.get("original", ing.get("originalString", "")),
            amount=ing.get("amount"),
            unit=ing.get("unit") or ing.get("measures", {}).get("metric", {}).get("unitShort"),
            image=f"https://spoonacular.com/cdn/ingredients_100x100/{ing['image']}"
            if ing.get("image")
            else None,
        )
        for ing in data.get("extendedIngredients", [])
    ]

    return RecipeIngredientsResponse(
        recipe_id=data["id"],
        title=data["title"],
        image=data.get("image"),
        ready_in_minutes=data.get("readyInMinutes"),
        servings=data.get("servings"),
        ingredients=ingredients,
    )
