import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';
import { MAP_HEADER_HEIGHT } from './MapHeader';

const EXTRA_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

export const MapOverlayUI: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'inStock'>('all');

  return (
    <View className="absolute left-4 right-4 z-20 gap-2.5" style={{ top: EXTRA_TOP + MAP_HEADER_HEIGHT + 16 }}>
      {/* AI insight chip */}
      <View
        className="flex-row items-center gap-3 self-start rounded-full px-4 py-3 border border-white/50"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
      >
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(0,88,188,0.12)' }}>
          <MaterialIcons name="psychology" size={18} color="#0058bc" />
        </View>
        <Text className="text-xs font-medium text-[#0f172a]">
          AI says <Text className="font-extrabold text-primary">Target</Text> is your best choice today.
        </Text>
      </View>

      {/* Filter pills */}
      <View className="flex-row gap-2">
        {(['all', 'inStock'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            className={clsx('px-4 py-2 rounded-full', activeFilter === filter ? 'bg-primary' : 'bg-white/88')}
            style={activeFilter !== filter ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 } : undefined}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.85}
          >
            <Text className={clsx('text-[10px] font-bold uppercase tracking-[0.8px]', activeFilter === filter ? 'text-white' : 'text-[#1e293b]')}>
              {filter === 'all' ? 'All Markets' : 'In Stock Only'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
