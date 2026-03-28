import { useState, useCallback } from 'react';
import { Store } from '../types/store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

// Radii to try in order when previous radius returns 0 stores
const RADIUS_STEPS_KM = [5, 10, 20];

export interface UseNearbyStoresResult {
  stores: Store[];
  loading: boolean;
  error: string | null;
  radiusKm: number; // radius that was actually used
  fetch: (lat: number, lng: number) => Promise<void>;
}

interface BackendStore {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance_km: number;
  distance_text: string;
  rating: number | null;
  total_ratings: number | null;
  is_open: boolean | null;
  place_id: string;
}

function backendToStore(s: BackendStore, index: number): Store {
  return {
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    distance: s.distance_text,
    distanceKm: s.distance_km,
    driveTime: `~${Math.max(1, Math.round(s.distance_km * 3))} min`,
    availableItems: 12,
    totalItems: 12,
    estimatedCost: 28 + index * 7,
    isTopPick: index === 0,
    hasMissingItems: false,
    rating: s.rating,
    totalRatings: s.total_ratings,
    isOpen: s.is_open,
    placeId: s.place_id,
  };
}

async function fetchAtRadius(lat: number, lng: number, radiusKm: number): Promise<Store[]> {
  const url = `${API_URL}/api/stores/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(14000) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return (data.stores as BackendStore[]).map((s, i) => backendToStore(s, i));
}

export function useNearbyStores(): UseNearbyStoresResult {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(RADIUS_STEPS_KM[0]);

  const fetchStores = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    setStores([]);
    setRadiusKm(RADIUS_STEPS_KM[0]);

    try {
      for (const radius of RADIUS_STEPS_KM) {
        setRadiusKm(radius);
        const result = await fetchAtRadius(lat, lng, radius);
        if (result.length > 0) {
          setStores(result);
          return;
        }
        // 0 results — try next radius (will be reflected in UI via radiusKm state)
      }
      // Exhausted all radii — still empty
      setStores([]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stores, loading, error, radiusKm, fetch: fetchStores };
}
