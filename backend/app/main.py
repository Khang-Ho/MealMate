from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.api.routes import stores as stores_router
from app.api.routes import recipes as recipes_router
from app.api.routes import saved_recipes as saved_recipes_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MealMate API",
    version="0.1.0",
    description="AI-powered grocery routing and meal planning backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stores_router.router, prefix="/api")
app.include_router(recipes_router.router, prefix="/api")
app.include_router(saved_recipes_router.router, prefix="/api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s %s — %s", request.method, request.url.path, str(exc))
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": "0.1.0",
        "google_places": bool(settings.google_places_api_key),
        "mapbox": bool(settings.mapbox_access_token),
        "gemini": bool(settings.gemini_api_key),
        "spoonacular": bool(settings.spoonacular_api_key),
        "supabase_saved_recipes": bool(
            settings.supabase_url and (settings.supabase_service_role_key or settings.supabase_anon_key)
        ),
    }
