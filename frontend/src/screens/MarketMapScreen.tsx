import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoreMapView } from '../components/StoreMapView';
import { MapMarkers } from '../components/MapMarkers';
import { MapHeader } from '../components/MapHeader';
import { MapOverlayUI } from '../components/MapOverlayUI';
import { StoreCarousel } from '../components/StoreCarousel';
import { BottomNavBar } from '../components/BottomNavBar';
import { Store } from '../types/store';
import { RootStackParamList } from '../navigation/types';
import { useNearbyStores } from '../hooks/useNearbyStores';

type MapNavProp = NativeStackNavigationProp<RootStackParamList, 'MarketMap'>;

// Default: Ho Chi Minh City center — replace with expo-location for live coords
const DEFAULT_LAT = 10.7769;
const DEFAULT_LNG = 106.7009;

export const MarketMapScreen: React.FC = () => {
  const navigation = useNavigation<MapNavProp>();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const { stores, loading, error } = useNearbyStores(DEFAULT_LAT, DEFAULT_LNG);

  const handleTabPress = (tabId: string) => {
    if (tabId === 'cook') navigation.navigate('Home');
    if (tabId === 'inventory') navigation.navigate('Inventory');
    if (tabId === 'route') navigation.navigate('ShoppingMap');
    if (tabId === 'settings') navigation.navigate('Settings');
  };

  return (
    <View className="flex-1 bg-map-dark">
      <StatusBar style="light" />

      {/* Live Mapbox map — shows real store pins from backend */}
      <StoreMapView
        centerLat={DEFAULT_LAT}
        centerLng={DEFAULT_LNG}
        stores={stores}
      />

      {/* Animated overlay markers (decorative on native, Mapbox markers are from StoreMapView) */}
      <MapMarkers />

      <MapHeader onBack={() => navigation.goBack()} onProfilePress={() => navigation.navigate('Settings')} />
      <MapOverlayUI />

      {/* Loading / error states */}
      {loading && (
        <View className="absolute top-20 left-0 right-0 items-center z-40" pointerEvents="none">
          <View className="bg-surface/90 px-4 py-2 rounded-full flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#0d631b" />
            <Text className="text-on-surface text-xs font-semibold">Đang tìm cửa hàng...</Text>
          </View>
        </View>
      )}
      {error && !loading && stores.length === 0 && (
        <View className="absolute top-20 left-4 right-4 items-center z-40" pointerEvents="none">
          <View className="bg-error-container px-4 py-2 rounded-xl">
            <Text className="text-on-error-container text-xs text-center">Không thể tải cửa hàng. Dùng dữ liệu mẫu.</Text>
          </View>
        </View>
      )}

      {/* Store carousel — shows real stores or falls back to mock */}
      <StoreCarousel
        stores={stores.length > 0 ? stores : undefined}
        onNavigate={(store: Store) => {
          setSelectedStore(store);
          console.log('Navigate to:', store.name);
        }}
        onSelect={(store: Store) => {
          setSelectedStore(store);
        }}
      />

      <BottomNavBar initialActive="stores" onTabPress={handleTabPress} />
    </View>
  );
};
