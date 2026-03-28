import React from 'react';
import { View, Image } from 'react-native';

/**
 * Placeholder map view using a static image.
 * Replace with @rnmapbox/maps when ready:
 *
 * import MapboxGL from '@rnmapbox/maps';
 * MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);
 *
 * export const StoreMapView = () => (
 *   <MapboxGL.MapView className="absolute inset-0" styleURL={MapboxGL.StyleURL.Dark}>
 *     <MapboxGL.Camera zoomLevel={14} centerCoordinate={[-122.4194, 37.7749]} />
 *   </MapboxGL.MapView>
 * );
 */

const MAP_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC9heK7BfvDD5E_pm2H7CzqorgNxaUdoB8tYNYK56H8iczl7knNvUXLCNRvpXfq77PB8AXC9qMCU5ckm9cmFRSL6bBLLKkZEH_Sdc8gLcHrNyl4vUFPiODpu3XFaNzIIgAZeYKfvzUdMJU48JjqAZxDP8iFouiLQ7k4AK4mXvUNbhpBiPjLhZ-4Ks9y_-kJCS6ItPKmwLDVpasMVLdz-304WL4nTPd0GIi4Ls-yPE-5ONrWCkDL8wolyxF8uMez3w7zurOUV1yeMVA';

export const StoreMapView: React.FC = () => (
  <View className="absolute inset-0 bg-map-dark">
    <Image source={{ uri: MAP_IMAGE_URI }} className="w-full h-full opacity-50" resizeMode="cover" />
  </View>
);
