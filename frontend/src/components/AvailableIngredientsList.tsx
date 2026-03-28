import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AVAILABLE_ITEMS = [
  { id: '1', name: 'Organic Eggs', quantity: '4 Units' },
  { id: '2', name: 'San Marzano Tomatoes', quantity: '800g (Canned)' },
  { id: '3', name: 'Yellow Onion', quantity: '1 Large' },
  { id: '4', name: 'Extra Virgin Olive Oil', quantity: 'Pantry Staple' },
];

export const AvailableIngredientsList: React.FC = () => (
  <View className="mb-4">
    <View className="flex-row items-center justify-between px-1 mb-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name="kitchen" size={20} color="#0d631b" />
        <Text className="text-base font-bold text-on-surface">In Fridge / Pantry</Text>
      </View>
      <Text className="text-xs italic text-on-surface-variant">Available</Text>
    </View>

    <View className="bg-surface-container-low rounded-[20px] p-3 gap-1.5">
      {AVAILABLE_ITEMS.map((item) => (
        <View
          key={item.id}
          className="flex-row items-center gap-3 rounded-xl py-3 px-3.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.65)' }}
        >
          <MaterialIcons name="check-circle" size={22} color="#88d982" />
          <Text className="text-sm font-medium text-on-surface flex-1">{item.name}</Text>
          <Text className="text-xs text-on-surface-variant">{item.quantity}</Text>
        </View>
      ))}
    </View>
  </View>
);
