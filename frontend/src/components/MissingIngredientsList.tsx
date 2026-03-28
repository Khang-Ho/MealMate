import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MissingItem {
  id: string;
  name: string;
  quantity: string;
  imageUrl: string;
}

const MISSING_ITEMS: MissingItem[] = [
  { id: '1', name: 'Red Bell Peppers', quantity: '2 Large', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAM-EvB40y1RkQGNrHWGhzndNGHCnDsBoXtFz5xVijLuGQYDfMeuqIbeq3XUg_gQN63dlokQ68qVIYGTWUsHbpmq-DW_enc7R4hlW6l_RqcvZtUs_xlysAABp5PoWUzD7INFwuA9qlXC5wV_j48jSKLRfQYcyrdGrJZaLOrGqmuSv3KOmuv7Igyr27UYcXlAd40fCOXuTx23kijV5Bh6ZjqF-6orgCfx5fX5TO5rchFOS9vZvJThWmn67dUoL8vn9EeeqaaIklyes' },
  { id: '2', name: 'Feta Cheese', quantity: '150g', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCutfvqlYWwj1JRkDzjHuOuxvbKHxjiwa5AQVdMvvhM0zXXztDgTDXCK56eKzcATFqObfZVfmdlar9nUNxjItT8objaW5G1ZKIu-cT5Hrd26Yg5JgF6bx0zwvyyaWQpbxHbSBv_0UtgQd2hLIxl0p1eYQEUn0z6tQbUpDEMMHaJMej9xjYDChpxsES-fOIao7MNyetl_fWdJ4ZPN6yJvdCnHXVTmgT7JYuNNIc4KNsW6VVf3bipUMQLDO5svy3wzdw0kR7fp4pFCbY' },
  { id: '3', name: 'Sourdough Loaf', quantity: '1 Loaf', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6McqPBQXL3XQ-ucH2bzyAIECAfnj3YzXTgBIQygRfBuxppQAeW8uCBS2P2mVmiLjJyD6xdgO7FRJLOoL_okR1FOZDfFoGIV51Xp9hIwMUaF2-g0vCuA45voib08fbSVQ8-oyPycLIgWdmctjvlPljaEwFvZ4-0SkuD_uRjBPMvvtZewrfYofuEa9JliwbPtkuWaCAe8Vr9TOSGNnIXa4xKQ2-5j6Q4ijtm_6r-QTk_bFRXvG5wbx6wIyNJtGjUbvLWQ5opV7Fec4' },
];

interface MissingIngredientsListProps {
  onAddToCart?: (item: MissingItem) => void;
}

export const MissingIngredientsList: React.FC<MissingIngredientsListProps> = ({ onAddToCart }) => (
  <View className="mb-8">
    <View className="flex-row items-center justify-between px-1 mb-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name="warning" size={20} color="#ba1a1a" />
        <Text className="text-base font-bold text-on-surface">Missing Ingredients</Text>
      </View>
      <View className="bg-error-container px-2.5 py-1 rounded-full">
        <Text className="text-[11px] font-bold text-on-error-container">{MISSING_ITEMS.length} Items Needed</Text>
      </View>
    </View>

    <View className="gap-3">
      {MISSING_ITEMS.map((item) => (
        <View
          key={item.id}
          className="flex-row items-center justify-between bg-surface-container-lowest rounded-2xl p-4 border-l-4 border-error"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <Image source={{ uri: item.imageUrl }} className="w-12 h-12 rounded-[10px]" resizeMode="cover" />
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-on-surface mb-0.5">{item.name}</Text>
              <Text className="text-[13px] text-on-surface-variant">Quantity: {item.quantity}</Text>
            </View>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-secondary-fixed items-center justify-center"
            activeOpacity={0.8}
            onPress={() => onAddToCart?.(item)}
          >
            <MaterialIcons name="add-shopping-cart" size={20} color="#001a41" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  </View>
);
