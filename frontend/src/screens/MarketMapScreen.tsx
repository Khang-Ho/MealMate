import React from 'react';
import { View } from 'react-native';
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
import { RootStackParamList } from '../navigation/AppNavigator';

type MapNavProp = NativeStackNavigationProp<RootStackParamList, 'MarketMap'>;

export const MarketMapScreen: React.FC = () => {
  const navigation = useNavigation<MapNavProp>();

  const handleTabPress = (tabId: string) => {
    if (tabId === 'cook') navigation.navigate('Home');
    if (tabId === 'inventory') navigation.navigate('IngredientChecklist', {});
    if (tabId === 'route') navigation.navigate('ShoppingMap');
  };

  return (
    <View className="flex-1 bg-map-dark">
      <StatusBar style="light" />
      <StoreMapView />
      <MapMarkers />
      <MapHeader onBack={() => navigation.goBack()} />
      <MapOverlayUI />
      <StoreCarousel
        onNavigate={(store: Store) => console.log('Navigate to:', store.name)}
        onSelect={(store: Store) => console.log('Select store:', store.name)}
      />
      <BottomNavBar initialActive="stores" onTabPress={handleTabPress} />
    </View>
  );
};
