import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';
import { Colors } from '../utils/colors';

type IngredientStatus = 'fridge' | 'pantry' | 'missing';

interface IngredientRow {
  id: string;
  name: string;
  status: IngredientStatus;
}

interface IngredientsChecklistProps {
  ingredients?: IngredientRow[];
  servings?: string;
}

const DEFAULT_INGREDIENTS: IngredientRow[] = [
  { id: '1', name: '2 Large Salmon Fillets (6oz each)', status: 'fridge' },
  { id: '2', name: '1 Bunch Fresh Asparagus', status: 'pantry' },
  { id: '3', name: '1 Organic Lemon (Zested)', status: 'missing' },
  { id: '4', name: '2 tbsp Extra Virgin Olive Oil', status: 'pantry' },
  { id: '5', name: 'Fresh Dill & Capers', status: 'missing' },
];

const STATUS_CONFIG: Record<IngredientStatus, { label: string; bg: string; textColor: string }> = {
  fridge: { label: 'In Fridge', bg: Colors.primaryFixed, textColor: Colors.primaryContainer },
  pantry: { label: 'Pantry', bg: Colors.primaryFixed, textColor: Colors.primaryContainer },
  missing: { label: 'Missing', bg: '#ffdad6', textColor: '#ba1a1a' },
};

export const IngredientsChecklist: React.FC<IngredientsChecklistProps> = ({
  ingredients = DEFAULT_INGREDIENTS,
  servings = '4 Servings',
}) => {
  const initialChecked = ingredients.reduce<Record<string, boolean>>((acc, item) => {
    acc[item.id] = item.status !== 'missing';
    return acc;
  }, {});

  const [checked, setChecked] = useState(initialChecked);
  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <View>
      <View className="flex-row justify-between items-end mb-4">
        <Text className="text-[26px] font-extrabold text-on-surface">Ingredients</Text>
        <Text className="text-[13px] font-medium text-on-surface-variant">{servings}</Text>
      </View>

      <View className="gap-2.5">
        {ingredients.map((item) => {
          const isChecked = checked[item.id];
          const badge = STATUS_CONFIG[item.status];
          return (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center bg-surface-container-low rounded-[14px] px-4 py-3.5 gap-3"
              onPress={() => toggle(item.id)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={isChecked ? '#0d631b' : '#707a6c'}
              />
              <Text className={clsx('flex-1 text-[15px] font-medium', isChecked ? 'text-outline line-through' : 'text-on-surface')}>
                {item.name}
              </Text>
              <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: badge.bg }}>
                <Text className="text-[11px] font-bold" style={{ color: badge.textColor }}>{badge.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
