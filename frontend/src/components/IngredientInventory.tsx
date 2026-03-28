import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';
import { IngredientItem } from '../types/recipe';

interface IngredientRow extends IngredientItem {
  icon: keyof typeof MaterialIcons.glyphMap;
}

const INGREDIENTS: IngredientRow[] = [
  { name: 'Large Eggs', quantity: '4 units', icon: 'egg-alt', inStock: true },
  { name: 'Bell Peppers', quantity: '2 units', icon: 'local-florist', inStock: true },
  { name: 'Crushed Tomatoes', quantity: '400g needed', icon: 'shopping-bag', inStock: false },
  { name: 'Fresh Parsley', quantity: '1 bunch', icon: 'spa', inStock: false },
];

export const IngredientInventory: React.FC = () => (
  <View className="bg-surface-container-low rounded-[28px] p-6 mx-6 mb-4">
    <View className="flex-row justify-between items-end mb-5">
      <View>
        <Text className="text-xl font-bold text-on-surface">Inventory</Text>
        <Text className="text-xs text-on-surface-variant mt-0.5">Check your kitchen status</Text>
      </View>
      <View className="bg-primary-fixed px-2.5 py-1 rounded-full">
        <Text className="text-[10px] font-bold text-on-primary-fixed">65% READY</Text>
      </View>
    </View>

    <View className="gap-2 mb-6">
      {INGREDIENTS.map((item, i) => (
        <View
          key={i}
          className={clsx('flex-row items-center justify-between bg-surface-container-lowest rounded-2xl p-3.5', !item.inStock && 'border-l-4 border-error')}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className={clsx('w-10 h-10 rounded-[10px] items-center justify-center', item.inStock ? 'bg-surface-container-low' : 'bg-[rgba(186,26,26,0.1)]')}>
              <MaterialIcons name={item.icon} size={20} color={item.inStock ? '#0d631b' : '#ba1a1a'} />
            </View>
            <View>
              <Text className="text-[13px] font-bold text-on-surface">{item.name}</Text>
              <Text className="text-[11px] text-on-surface-variant mt-0.5">{item.quantity}</Text>
            </View>
          </View>
          <View className={clsx('px-2 py-1 rounded-md', item.inStock ? 'bg-[rgba(13,99,27,0.1)]' : 'bg-[rgba(186,26,26,0.1)]')}>
            <Text className={clsx('text-[9px] font-bold uppercase tracking-[0.5px]', item.inStock ? 'text-primary' : 'text-error')}>
              {item.inStock ? 'In Stock' : 'Missing'}
            </Text>
          </View>
        </View>
      ))}
    </View>

    <View className="gap-2.5 pt-5 border-t border-outline-variant/25">
      <TouchableOpacity
        className="flex-row items-center justify-center gap-2.5 bg-primary py-4 rounded-full"
        style={{ shadowColor: '#0d631b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
        activeOpacity={0.85}
      >
        <MaterialIcons name="shopping-cart" size={18} color="#fff" />
        <Text className="text-white font-bold text-[15px]">Find Ingredients Nearby</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center justify-center gap-2.5 bg-secondary-fixed-dim py-4 rounded-full" activeOpacity={0.85}>
        <MaterialIcons name="map" size={18} color="#001a41" />
        <Text className="text-on-secondary-fixed font-bold text-[15px]">View Route to Store</Text>
      </TouchableOpacity>
    </View>
  </View>
);
