import math
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
GROCERY_TYPES = ["grocery_or_supermarket", "supermarket"]


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km between two coordinates."""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _format_distance(km: float) -> str:
    if km < 1.0:
        return f"{int(km * 1000)} m"
    return f"{km:.1f} km"


async def get_nearby_stores(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
) -> list[dict]:
    """Fetch nearby grocery stores using Google Places Nearby Search API."""
    if not settings.google_places_api_key:
        logger.warning("GOOGLE_PLACES_API_KEY not set — returning mock data")
        return _mock_stores(lat, lng)

    radius_m = min(int(radius_km * 1000), 50000)
    results: list[dict] = []

    async with httpx.AsyncClient(timeout=10.0) as client:
        for store_type in GROCERY_TYPES:
            try:
                resp = await client.get(
                    PLACES_NEARBY_URL,
                    params={
                        "location": f"{lat},{lng}",
                        "radius": radius_m,
                        "type": store_type,
                        "key": settings.google_places_api_key,
                    },
                )
                resp.raise_for_status()
                data = resp.json()

                if data.get("status") not in ("OK", "ZERO_RESULTS"):
                    logger.warning("Places API error", status=data.get("status"), type=store_type)
                    continue

                for place in data.get("results", []):
                    place_id = place["place_id"]
                    if any(r["place_id"] == place_id for r in results):
                        continue  # deduplicate across type queries

                    place_lat = place["geometry"]["location"]["lat"]
                    place_lng = place["geometry"]["location"]["lng"]
                    dist_km = _haversine_km(lat, lng, place_lat, place_lng)

                    results.append({
                        "id": place_id,
                        "name": place.get("name", "Unknown"),
                        "address": place.get("vicinity", ""),
                        "lat": place_lat,
                        "lng": place_lng,
                        "distance_km": round(dist_km, 2),
                        "distance_text": _format_distance(dist_km),
                        "rating": place.get("rating"),
                        "total_ratings": place.get("user_ratings_total"),
                        "is_open": place.get("opening_hours", {}).get("open_now"),
                        "icon": place.get("icon"),
                        "place_id": place_id,
                    })

            except httpx.HTTPError as exc:
                logger.error("Google Places request failed", error=str(exc), type=store_type)

    results.sort(key=lambda s: s["distance_km"])
    return results


def _mock_stores(lat: float, lng: float) -> list[dict]:
    """Return mock stores when API key is not configured."""
    offsets = [
        (0.008, 0.005, "Whole Foods Market", "123 Main St"),
        (-0.004, 0.010, "Walmart Supercenter", "456 Oak Ave"),
        (0.015, -0.007, "Target", "789 Pine Rd"),
        (-0.010, -0.012, "Kroger", "321 Elm Blvd"),
    ]
    stores = []
    for i, (dlat, dlng, name, addr) in enumerate(offsets):
        slat, slng = lat + dlat, lng + dlng
        dist = _haversine_km(lat, lng, slat, slng)
        pid = f"mock_{i}"
        stores.append({
            "id": pid,
            "name": name,
            "address": addr,
            "lat": slat,
            "lng": slng,
            "distance_km": round(dist, 2),
            "distance_text": _format_distance(dist),
            "rating": round(3.8 + i * 0.15, 1),
            "total_ratings": 200 + i * 50,
            "is_open": True,
            "icon": None,
            "place_id": pid,
        })
    return sorted(stores, key=lambda s: s["distance_km"])
