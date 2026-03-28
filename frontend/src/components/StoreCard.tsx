import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';
import { Store } from '../types/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const STORE_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 384);

interface StoreCardProps {
  store: Store;
  onNavigate?: () => void;
  onSelect?: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onNavigate, onSelect }) => {
  const { name, address, distance, driveTime, availableItems, totalItems, estimatedCost, isTopPick, hasMissingItems } = store;
  const pct = availableItems / totalItems;

  return (
    <View
      className={clsx('bg-white rounded-3xl p-5 overflow-hidden', isTopPick ? 'border-2 border-primary' : 'opacity-[0.88]')}
      style={{ width: STORE_CARD_WIDTH, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 }}
    >
      {isTopPick && (
        <View className="absolute top-0 right-0 bg-primary px-3.5 py-1.5 rounded-bl-2xl">
          <Text className="text-white text-[9px] font-black tracking-[0.5px]">TOP PICK</Text>
        </View>
      )}

      {/* Header */}
      <View className="flex-row justify-between items-start mb-4 mt-0.5">
        <View className="flex-1 pr-2">
          <Text className="text-lg font-extrabold text-[#0f172a] mb-1" numberOfLines={1}>{name}</Text>
          <View className="flex-row items-center gap-0.5">
            <MaterialIcons name="location-on" size={12} color="#94a3b8" />
            <Text className="text-[11px] text-[#94a3b8] flex-1" numberOfLines={1}>{address} • {distance} • {driveTime}</Text>
          </View>
        </View>
        {isTopPick && (
          <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(46,125,50,0.1)' }}>
            <MaterialIcons name="directions-run" size={20} color="#0d631b" />
          </View>
        )}
      </View>

      {/* Stats */}
      <View className="flex-row gap-2.5 mb-4">
        <View className={clsx('flex-1 rounded-xl p-3', hasMissingItems ? 'bg-[rgba(186,26,26,0.05)] border border-[rgba(186,26,26,0.12)]' : 'bg-surface-container-low border border-[rgba(191,202,186,0.15)]')}>
          <Text className={clsx('text-[8px] font-bold uppercase tracking-[0.5px] mb-1', hasMissingItems ? 'text-error' : 'text-outline')}>
            {hasMissingItems ? 'Missing Items' : 'In Stock'}
          </Text>
          <Text className={clsx('text-[22px] font-black leading-6', hasMissingItems ? 'text-error' : 'text-primary')}>
            {availableItems}/{totalItems}
          </Text>
          {!hasMissingItems && (
            <View className="w-full h-1 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
              <View className="h-full bg-primary rounded-full" style={{ width: `${pct * 100}%` }} />
            </View>
          )}
        </View>

        <View className="flex-1 rounded-xl p-3 bg-[rgba(0,88,188,0.05)] border border-[rgba(0,88,188,0.1)]">
          <Text className="text-[8px] font-bold text-secondary uppercase tracking-[0.5px] mb-1">Est. Cost</Text>
          <View className="flex-row items-end gap-1">
            <Text className="text-[22px] font-black text-secondary leading-6">${estimatedCost.toFixed(2)}</Text>
            <Text className="text-[9px] font-bold mb-0.5" style={{ color: 'rgba(0,88,188,0.5)' }}>Avg.</Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      {isTopPick ? (
        <TouchableOpacity
          className="bg-primary flex-row items-center justify-center gap-2 py-3.5 rounded-2xl"
          style={{ shadowColor: '#0d631b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
          activeOpacity={0.85}
          onPress={onNavigate}
        >
          <MaterialIcons name="near-me" size={18} color="#fff" />
          <Text className="text-white font-bold text-sm">Start Navigation</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="bg-[#f1f5f9] items-center justify-center py-3.5 rounded-2xl"
          activeOpacity={0.85}
          onPress={onSelect}
        >
          <Text className="text-[#0f172a] font-bold text-sm">Select Store</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
