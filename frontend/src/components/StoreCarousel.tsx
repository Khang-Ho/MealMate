import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { StoreCard, STORE_CARD_WIDTH } from './StoreCard';
import { Store } from '../types/store';

const BOTTOM_NAV_HEIGHT = Platform.OS === 'android' ? 80 : 90;

const MOCK_STORES: Store[] = [
  { id: 'target', name: 'Target Supercenter', address: '789 Market St', distance: '0.8 mi', distanceKm: 1.3, driveTime: '6m drive', availableItems: 12, totalItems: 12, estimatedCost: 42.5, isTopPick: true },
  { id: 'wholefoods', name: 'Whole Foods', address: '1250 Steiner St', distance: '1.4 mi', distanceKm: 2.3, driveTime: '12m drive', availableItems: 12, totalItems: 12, estimatedCost: 68.2 },
  { id: 'safeway', name: 'Safeway', address: '2020 Market St', distance: '0.5 mi', distanceKm: 0.8, driveTime: '4m drive', availableItems: 10, totalItems: 12, estimatedCost: 38.9, hasMissingItems: true },
];

interface StoreCarouselProps {
  stores?: Store[];
  onNavigate?: (store: Store) => void;
  onSelect?: (store: Store) => void;
}

export const StoreCarousel: React.FC<StoreCarouselProps> = ({
  stores = MOCK_STORES,
  onNavigate,
  onSelect,
}) => (
  <View className="absolute left-0 right-0 z-30" style={{ bottom: BOTTOM_NAV_HEIGHT + 8 }}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
      snapToInterval={STORE_CARD_WIDTH + 12}
      snapToAlignment="start"
      decelerationRate="fast"
    >
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          onNavigate={() => onNavigate?.(store)}
          onSelect={() => onSelect?.(store)}
        />
      ))}
    </ScrollView>
  </View>
);
