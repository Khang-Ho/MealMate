import React, { useState } from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../components/AppHeader';
import { BottomNavBar } from '../components/BottomNavBar';
import { MapSearchBar } from '../components/MapSearchBar';
import { MapStoreMarker } from '../components/MapStoreMarker';
import { StoreCard } from '../components/StoreCard';
import { Store } from '../types/store';
import { RootStackParamList } from '../navigation/types';

type ShoppingMapNavProp = NativeStackNavigationProp<RootStackParamList, 'ShoppingMap'>;

const MAP_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4pSbDyPU3HBjHZwvBGMTSD128Lmsj550L00o5CK7VZht_R9pk3WEU9adrqCMNwXtBGLfUfDySFXedP-f0rGkHF9xGpbhQ22OTqNT0XsH8YfOcN6zSVhyboQvrNFAeVEB5De1xywVbMvOykorISkhpZTR23_10DLslyWvd3XvwjdSaGPuTKD3ln2UA562o1Xj_8sWWoHasK3PljldF0Bqgw33OMqqRUyVFj3U_FKMFkBkTT_1WJD-Jid90IFaVqg';

const STORES: Store[] = [
  { id: 'wf', name: 'Whole Foods', address: 'Lincoln Park', distance: '0.8 mi', driveTime: '7m drive', availableItems: 18, totalItems: 18, estimatedCost: 42.85, isTopPick: true },
  { id: 'wm', name: 'Walmart', address: 'South Loop', distance: '1.5 mi', driveTime: '12m drive', availableItems: 17, totalItems: 18, estimatedCost: 38.12 },
  { id: 'tg', name: 'Target', address: 'Gold Coast', distance: '2.4 mi', driveTime: '18m drive', availableItems: 12, totalItems: 18, estimatedCost: 39.9, hasMissingItems: true },
];

export const ShoppingMapScreen: React.FC = () => {
  const navigation = useNavigation<ShoppingMapNavProp>();
  const [_activeStore, setActiveStore] = useState<string>('wf');

  const handleTabPress = (tabId: string) => {
    if (tabId === 'cook') navigation.navigate('Home');
    if (tabId === 'inventory') navigation.navigate('Inventory');
    if (tabId === 'stores') navigation.navigate('MarketMap');
    if (tabId === 'settings') navigation.navigate('Settings');
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0 }}
    >
      <RNStatusBar barStyle="dark-content" />
      <AppHeader onProfilePress={() => navigation.navigate('Settings')} />

      <View className="flex-1 relative overflow-hidden">
        <ImageBackground
          source={{ uri: MAP_BG }}
          className="absolute inset-0"
          resizeMode="cover"
          imageStyle={{ opacity: 0.82 }}
        />

        <MapSearchBar />

        <MapStoreMarker name="Whole Foods" distance="0.8 mi" icon="eco" status="available" onPress={() => setActiveStore('wf')} style={{ top: '28%', left: '20%' }} />
        <MapStoreMarker name="Target" distance="2.4 mi" icon="storefront" status="missing" onPress={() => setActiveStore('tg')} style={{ top: '46%', left: '55%' }} />
        <MapStoreMarker name="Walmart" distance="1.5 mi" icon="local-grocery-store" status="available" onPress={() => setActiveStore('wm')} style={{ top: '18%', left: '68%' }} />

        <View className="absolute bottom-[100px] left-0 right-0" pointerEvents="box-none">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
            decelerationRate="fast"
            snapToInterval={324}
            snapToAlignment="start"
          >
            {STORES.map((store) => (
              <StoreCard key={store.id} store={store} onNavigate={() => console.log(`Navigate to ${store.name}`)} />
            ))}
          </ScrollView>
        </View>
      </View>

      <BottomNavBar initialActive="route" onTabPress={handleTabPress} />
    </View>
  );
};
