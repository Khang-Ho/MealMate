from pydantic import BaseModel


class RecipeIngredient(BaseModel):
    id: int | None = None
    name: str
    original: str          # e.g. "2 cups all-purpose flour"
    amount: float | None = None
    unit: str | None = None
    image: str | None = None  # Spoonacular ingredient image slug


class RecipeResult(BaseModel):
    id: int
    title: str
    image: str | None = None
    ready_in_minutes: int | None = None
    servings: int | None = None
    cuisines: list[str] = []
    diets: list[str] = []
    summary: str | None = None


class RecipeSearchResponse(BaseModel):
    results: list[RecipeResult]
    total_results: int
    query: str


class RecipeIngredientsResponse(BaseModel):
    recipe_id: int
    title: str
    image: str | None = None
    ready_in_minutes: int | None = None
    servings: int | None = None
    ingredients: list[RecipeIngredient]
