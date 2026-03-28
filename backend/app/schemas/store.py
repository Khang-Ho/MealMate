from pydantic import BaseModel, ConfigDict


class StoreLocation(BaseModel):
    lat: float
    lng: float


class StoreResponse(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float
    distance_km: float
    distance_text: str
    rating: float | None = None
    total_ratings: int | None = None
    is_open: bool | None = None
    icon: str | None = None
    place_id: str

    model_config = ConfigDict(from_attributes=True)


class NearbyStoresResponse(BaseModel):
    stores: list[StoreResponse]
    total: int
    center_lat: float
    center_lng: float
