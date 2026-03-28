import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice: string;
  category: string;
}

interface ShoppingListCardProps {
  items?: ShoppingItem[];
  storeNote?: string;
  onAddToRoute?: () => void;
}

const DEFAULT_ITEMS: ShoppingItem[] = [
  { id: '1', name: 'Organic Lemon', estimatedPrice: '$0.89', category: 'Produce' },
  { id: '2', name: 'Fresh Dill', estimatedPrice: '$1.99', category: 'Herbs' },
  { id: '3', name: 'Non-Pareil Capers', estimatedPrice: '$3.50', category: 'Pantry' },
];

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
  items = DEFAULT_ITEMS,
  storeNote = 'These items are available at "Green Grocer" which is currently on your active commuter route.',
  onAddToRoute,
}) => (
  <View
    className="bg-surface-container-lowest rounded-3xl p-6"
    style={{ shadowColor: '#181d17', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 }}
  >
    <View className="flex-row items-center gap-2.5 mb-5">
      <MaterialIcons name="shopping-cart" size={22} color="#ba1a1a" />
      <Text className="text-xl font-extrabold text-on-surface">What you need to buy</Text>
    </View>

    <View className="mb-6">
      {items.map((item, index) => (
        <View
          key={item.id}
          className={`flex-row justify-between items-center py-3.5 ${index < items.length - 1 ? 'border-b border-outline-variant/20' : ''}`}
        >
          <View className="flex-1 pr-3">
            <Text className="text-[15px] font-bold text-on-surface mb-0.5">{item.name}</Text>
            <Text className="text-xs text-on-surface-variant">Estimated: {item.estimatedPrice}</Text>
          </View>
          <View className="bg-surface-container px-3 py-1.5 rounded-full">
            <Text className="text-[11px] font-bold text-on-surface">{item.category}</Text>
          </View>
        </View>
      ))}
    </View>

    <TouchableOpacity
      className="bg-primary flex-row items-center justify-center gap-2 py-4 rounded-full mb-4"
      style={{ shadowColor: '#0d631b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
      activeOpacity={0.85}
      onPress={onAddToRoute}
    >
      <MaterialIcons name="add-road" size={20} color="#fff" />
      <Text className="text-white text-base font-bold">Add missing to route</Text>
    </TouchableOpacity>

    {storeNote && (
      <View className="flex-row items-start gap-2 rounded-xl p-3" style={{ backgroundColor: 'rgba(0,88,188,0.08)' }}>
        <MaterialIcons name="info" size={14} color="#0058bc" style={{ marginTop: 1 }} />
        <Text className="flex-1 text-xs text-secondary font-medium leading-[18px]">{storeNote}</Text>
      </View>
    )}
  </View>
);
