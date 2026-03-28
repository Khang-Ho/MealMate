"""Spoonacular recipe search and ingredient fetch service."""
from __future__ import annotations

import logging
import re

import httpx

from app.core.config import settings

log = logging.getLogger(__name__)

BASE = "https://api.spoonacular.com"

MOCK_RECIPES = [
    {
        "id": 716429,
        "title": "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
        "image": "https://spoonacular.com/recipeImages/716429-312x231.jpg",
        "readyInMinutes": 45,
        "servings": 2,
        "cuisines": ["Italian"],
        "diets": ["dairy free", "lacto ovo vegetarian"],
        "summary": "A quick and delicious pasta dish.",
    },
    {
        "id": 715538,
        "title": "What to make for dinner tonight?? Bruschetta Style Pork & Pasta",
        "image": "https://spoonacular.com/recipeImages/715538-312x231.jpg",
        "readyInMinutes": 35,
        "servings": 4,
        "cuisines": ["Italian"],
        "diets": [],
        "summary": "A delicious Italian pasta with pork.",
    },
    {
        "id": 782601,
        "title": "Red Lentil Soup with Chicken and Turnips",
        "image": "https://spoonacular.com/recipeImages/782601-312x231.jpg",
        "readyInMinutes": 55,
        "servings": 6,
        "cuisines": [],
        "diets": ["gluten free", "dairy free"],
        "summary": "A hearty and healthy soup.",
    },
]

MOCK_INGREDIENTS: dict[int, list[dict]] = {
    716429: [
        {"id": 20420, "name": "pasta", "original": "1 lb pasta", "amount": 1.0, "unit": "lb"},
        {"id": 11215, "name": "garlic", "original": "6 cloves garlic", "amount": 6.0, "unit": "clove"},
        {"id": 11291, "name": "scallions", "original": "1 bunch scallions", "amount": 1.0, "unit": "bunch"},
        {"id": 11135, "name": "cauliflower", "original": "1 head cauliflower", "amount": 1.0, "unit": "head"},
        {"id": 18079, "name": "breadcrumbs", "original": "1/2 cup breadcrumbs", "amount": 0.5, "unit": "cup"},
        {"id": 4053, "name": "olive oil", "original": "3 tbsp olive oil", "amount": 3.0, "unit": "tbsp"},
        {"id": 1102047, "name": "salt and pepper", "original": "salt and pepper to taste", "amount": 1.0, "unit": ""},
    ],
}


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


async def search_recipes(
    query: str,
    cuisine: str | None = None,
    diet: str | None = None,
    number: int = 12,
) -> dict:
    if not settings.spoonacular_api_key:
        log.warning("No Spoonacular key — returning mock results")
        filtered = MOCK_RECIPES
        if cuisine:
            filtered = [r for r in filtered if any(
                c.lower() == cuisine.lower() for c in r["cuisines"]
            )]
        return {
            "results": filtered[:number],
            "totalResults": len(filtered),
        }

    params: dict[str, str | int] = {
        "apiKey": settings.spoonacular_api_key,
        "query": query,
        "number": number,
        "addRecipeInformation": "true",
        "fillIngredients": "false",
        "instructionsRequired": "false",
    }
    if cuisine:
        params["cuisine"] = cuisine
    if diet:
        params["diet"] = diet

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{BASE}/recipes/complexSearch", params=params)
        resp.raise_for_status()
        data = resp.json()

    # Summarise heavy HTML summaries to first sentence
    for r in data.get("results", []):
        if r.get("summary"):
            r["summary"] = _strip_html(r["summary"])[:200]

    return data


async def get_recipe_ingredients(recipe_id: int) -> dict:
    """Return recipe info + extendedIngredients from Spoonacular."""
    if not settings.spoonacular_api_key:
        mock_ings = MOCK_INGREDIENTS.get(recipe_id, [
            {"id": 1, "name": "chicken breast", "original": "2 chicken breasts", "amount": 2.0, "unit": ""},
            {"id": 2, "name": "garlic", "original": "3 cloves garlic", "amount": 3.0, "unit": "clove"},
            {"id": 3, "name": "olive oil", "original": "2 tbsp olive oil", "amount": 2.0, "unit": "tbsp"},
            {"id": 4, "name": "lemon juice", "original": "juice of 1 lemon", "amount": 1.0, "unit": ""},
            {"id": 5, "name": "salt", "original": "1 tsp salt", "amount": 1.0, "unit": "tsp"},
            {"id": 6, "name": "black pepper", "original": "1/2 tsp black pepper", "amount": 0.5, "unit": "tsp"},
            {"id": 7, "name": "paprika", "original": "1 tsp paprika", "amount": 1.0, "unit": "tsp"},
        ])
        mock_recipe = next((r for r in MOCK_RECIPES if r["id"] == recipe_id), None)
        title = mock_recipe["title"] if mock_recipe else f"Recipe #{recipe_id}"
        image = mock_recipe.get("image") if mock_recipe else None
        return {
            "id": recipe_id,
            "title": title,
            "image": image,
            "readyInMinutes": mock_recipe.get("readyInMinutes") if mock_recipe else None,
            "servings": mock_recipe.get("servings") if mock_recipe else None,
            "extendedIngredients": mock_ings,
        }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{BASE}/recipes/{recipe_id}/information",
            params={"apiKey": settings.spoonacular_api_key, "includeNutrition": "false"},
        )
        resp.raise_for_status()

    return resp.json()
