from pydantic import BaseModel, Field


class SavedRecipeRow(BaseModel):
    id: str
    user_id: str
    spoonacular_id: int
    title: str
    image: str | None = None
    ready_minutes: int | None = None
    servings: int | None = None


class SavedRecipeCreate(BaseModel):
    user_id: str = Field(..., min_length=1, description="Clerk user id (user_...)")
    spoonacular_id: int
    title: str = Field(..., min_length=1)
    image: str | None = None
    ready_minutes: int | None = None
    servings: int | None = None


class SavedRecipesListResponse(BaseModel):
    recipes: list[SavedRecipeRow]
