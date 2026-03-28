from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/mealmate"
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Cache
    redis_url: str = "redis://localhost:6379"

    # AI
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"

    # Mapbox
    mapbox_access_token: str = ""

    # Google
    google_places_api_key: str = ""

    # Kroger
    kroger_client_id: str = ""
    kroger_client_secret: str = ""

    # Spoonacular
    spoonacular_api_key: str = ""

    # Serper
    serper_api_key: str = ""

    # Clerk
    clerk_secret_key: str = ""

    # App
    cors_origins: list[str] = ["*"]

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
