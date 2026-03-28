import React from 'react';
import { View, Image } from 'react-native';
import { Store } from '../types/store';

export interface StoreMapViewProps {
  centerLat?: number;
  centerLng?: number;
  stores?: Store[];
  onStorePress?: (store: Store) => void;
}

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

/**
 * Native map using @rnmapbox/maps (interactive).
 * Requires: npx expo prebuild && npx expo run:ios|android
 * Falls back to static image if SDK unavailable (e.g. Expo Go).
 */
export const StoreMapView: React.FC<StoreMapViewProps> = ({
  centerLat = 10.7769,
  centerLng = 106.7009,
  stores = [],
}) => {
  try {
    // Dynamic require — won't crash Expo Go, just falls through to catch
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MapboxGL = require('@rnmapbox/maps').default;
    if (MAPBOX_TOKEN) MapboxGL.setAccessToken(MAPBOX_TOKEN);

    return (
      <MapboxGL.MapView
        style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        styleURL="mapbox://styles/mapbox/dark-v11"
        compassEnabled={false}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapboxGL.Camera
          zoomLevel={13}
          centerCoordinate={[centerLng, centerLat]}
          animationMode="flyTo"
          animationDuration={1200}
        />
        <MapboxGL.UserLocation visible animated />

        {(stores ?? []).map((store) =>
          store.lat != null && store.lng != null ? (
            <MapboxGL.MarkerView
              key={store.id}
              coordinate={[store.lng, store.lat]}
              id={store.id}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: store.isTopPick
                    ? '#0d631b'
                    : store.hasMissingItems
                    ? '#ba1a1a'
                    : '#0058bc',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: '#fff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                  }}
                />
              </View>
            </MapboxGL.MarkerView>
          ) : null,
        )}
      </MapboxGL.MapView>
    );
  } catch {
    // Expo Go or prebuild not done — use Mapbox Static Images API
    return <StaticFallback centerLat={centerLat} centerLng={centerLng} stores={stores} />;
  }
};

function StaticFallback({ centerLat, centerLng, stores = [] }: StoreMapViewProps) {
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
}
