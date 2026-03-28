import React from 'react';
import { View, Image } from 'react-native';
import { Store } from '../types/store';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

export interface StoreMapViewProps {
  centerLat?: number;
  centerLng?: number;
  stores?: Store[];
  onStorePress?: (store: Store) => void;
}

/**
 * Web fallback — Mapbox Static Images API (no SDK, no mapbox-gl dep).
 * Shows a static dark map with coloured pins for each store.
 */
export const StoreMapView: React.FC<StoreMapViewProps> = ({
  centerLat = 10.7769,
  centerLng = 106.7009,
  stores = [],
}) => {
  const markers = (stores ?? [])
    .filter((s) => s.lat != null && s.lng != null)
    .slice(0, 6)
    .map((s) => `pin-s+${s.isTopPick ? '0d631b' : 'ba1a1a'}(${s.lng!},${s.lat!})`)
    .join(',');

  const overlay = markers ? `${markers},` : '';
  const uri = MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${overlay}${centerLng},${centerLat},13,0/800x600@2x?access_token=${MAPBOX_TOKEN}`
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9heK7BfvDD5E_pm2H7CzqorgNxaUdoB8tYNYK56H8iczl7knNvUXLCNRvpXfq77PB8AXC9qMCU5ckm9cmFRSL6bBLLKkZEH_Sdc8gLcHrNyl4vUFPiODpu3XFaNzIIgAZeYKfvzUdMJU48JjqAZxDP8iFouiLQ7k4AK4mXvUNbhpBiPjLhZ-4Ks9y_-kJCS6ItPKmwLDVpasMVLdz-304WL4nTPd0GIi4Ls-yPE-5ONrWCkDL8wolyxF8uMez3w7zurOUV1yeMVA';

  return (
    <View className="absolute inset-0 bg-map-dark">
      <Image
        source={{ uri }}
        className="w-full h-full"
        resizeMode="cover"
        style={{ opacity: 0.85 }}
      />
    </View>
  );
};
