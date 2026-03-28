from fastapi import APIRouter, Query, HTTPException
from app.schemas.store import NearbyStoresResponse, StoreResponse
from app.services import store_service

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("/nearby", response_model=NearbyStoresResponse)
async def get_nearby_stores(
    lat: float = Query(..., description="Latitude", ge=-90, le=90),
    lng: float = Query(..., description="Longitude", ge=-180, le=180),
    radius_km: float = Query(5.0, description="Search radius in km", ge=0.1, le=50),
):
    """
    Return grocery stores near the given coordinates.
    Uses Google Places Nearby Search API, falls back to mock data if key absent.
    """
    try:
        raw = await store_service.get_nearby_stores(lat, lng, radius_km)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Store search failed: {exc}") from exc

    stores = [StoreResponse(**s) for s in raw]
    return NearbyStoresResponse(
        stores=stores,
        total=len(stores),
        center_lat=lat,
        center_lng=lng,
    )
