import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RecipeStep } from '../types/recipe';

const STEPS: RecipeStep[] = [
  { number: 1, title: 'The Base Sauté', description: 'Heat olive oil in a large skillet. Add diced onions and bell peppers. Sauté for 5 minutes until soft and slightly caramelized to release natural sugars.' },
  { number: 2, title: 'Simmering Sauce', description: 'Stir in minced garlic, cumin, paprika, and crushed tomatoes. Reduce heat and let simmer for 10 minutes until the sauce thickens and flavors meld.' },
  { number: 3, title: 'The AI Poach', description: 'Make small wells in the sauce and crack eggs into them. Cover and cook for 5-8 minutes. AI sensors suggest 6:30 for a runny yolk with firm whites.' },
];

interface RecipeStepsProps {
  steps?: RecipeStep[];
  title?: string;
}

export const RecipeSteps: React.FC<RecipeStepsProps> = ({
  steps = STEPS,
  title = 'Recipe Instructions',
}) => (
  <View
    className="bg-surface-container-lowest rounded-[28px] p-7 mx-6 mb-4"
    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 2 }}
  >
    <View className="flex-row items-center gap-2.5 mb-7">
      <MaterialIcons name="menu-book" size={22} color="#0d631b" />
      <Text className="text-xl font-bold text-on-surface">{title}</Text>
    </View>

    <View>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <View key={step.number} className="flex-row gap-5">
            <View className="items-center">
              <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                <Text className="text-white font-bold text-base">{step.number}</Text>
              </View>
              {!isLast && <View className="w-0.5 flex-1 min-h-5 bg-surface-container-high my-1" />}
            </View>
            <View className={`flex-1 pb-1 ${!isLast ? 'pb-8' : ''}`}>
              <Text className="text-base font-bold text-on-surface mt-2 mb-1.5">{step.title}</Text>
              <Text className="text-sm text-on-surface-variant leading-[22px]">{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  </View>
);
