import { useState, useEffect, useCallback } from 'react';
import { Store } from '../types/store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface UseNearbyStoresResult {
  stores: Store[];
  loading: boolean;
  error: string | null;
  refetch: (lat: number, lng: number) => Promise<void>;
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
    driveTime: `${Math.round(s.distance_km * 3)}m drive`,
    availableItems: 12,
    totalItems: 12,
    estimatedCost: 30 + index * 8,
    isTopPick: index === 0,
    hasMissingItems: index > 1 && s.is_open === false,
  };
}

export function useNearbyStores(
  initialLat = 10.7769,
  initialLng = 106.7009,
): UseNearbyStoresResult {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/api/stores/nearby?lat=${lat}&lng=${lng}&radius_km=5`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setStores(
        (data.stores as BackendStore[]).map((s, i) => backendToStore(s, i)),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      console.warn('[useNearbyStores] fetch failed:', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(initialLat, initialLng);
  }, [initialLat, initialLng, refetch]);

  return { stores, loading, error, refetch };
}
