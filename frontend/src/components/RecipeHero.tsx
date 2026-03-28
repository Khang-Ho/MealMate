import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round((SCREEN_WIDTH - 48) * 1.1);

const IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGCBnHXFXwn1vo0fZ7pmAaz_JDytu7Rr9C9KnvpvXzdQlCAB4YfEyVlqDcQO4efpwtTnr5sAbhn_IVJbwD7UHhna9XFO4S6JUOQtNTqeZCStiIKkOwkcX8XufHBBJZzLpCqHELPvn8n4vwGJFEqXomxLO5FUgEhTuejurbA4_1RneBVon96TugrakA3JqZIkCstuNuLxF0v_wh3TUx5rElHQNg9NPQjnQB_2ziZso6H0b1cGr-jW84f-1axrpQcfkM7F2pi8KQjg';

const STATS = [
  { icon: 'schedule' as const, label: '25 Mins', isAI: false },
  { icon: 'local-fire-department' as const, label: '320 kcal', isAI: false },
  { icon: 'auto-fix-high' as const, label: 'AI Perfect-Poach', isAI: true },
];

export const RecipeHero: React.FC = () => (
  <View className="px-6 pt-6 mb-2">
    <View
      className="rounded-[28px] overflow-hidden mb-6"
      style={{ height: IMAGE_HEIGHT, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 }}
    >
      <Image source={{ uri: IMAGE_URI }} className="w-full h-full" resizeMode="cover" />
      <View
        className="absolute bottom-4 left-4 bg-surface-container-lowest p-3.5 rounded-2xl max-w-[190px]"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}
      >
        <Text className="text-[9px] font-bold text-primary uppercase tracking-[1px] mb-1">CHEF'S TIP</Text>
        <Text className="text-[11px] italic text-on-surface-variant leading-4">
          "Add a pinch of smoked paprika for an earthy depth of flavor."
        </Text>
      </View>
    </View>

    <Text className="text-[11px] font-semibold text-secondary uppercase tracking-[1.5px] mb-2">Premium Recipe</Text>
    <Text className="text-[36px] font-black text-on-surface leading-[40px] mb-3">
      {'Mediterranean\nShakshuka'}
    </Text>
    <Text className="text-[15px] text-on-surface-variant leading-6 mb-5">
      A vibrant, spiced tomato and bell pepper base topped with perfectly poached eggs and fresh herbs. A timeless classic refined by AI precision.
    </Text>

    <View className="flex-row flex-wrap gap-2 mb-2">
      {STATS.map((stat, i) => (
        <View
          key={i}
          className={clsx('flex-row items-center gap-1.5 px-3.5 py-2 rounded-full', stat.isAI ? 'bg-secondary-fixed' : 'bg-surface-container-low')}
        >
          <MaterialIcons name={stat.icon} size={14} color={stat.isAI ? '#001a41' : '#0d631b'} />
          <Text className={clsx('text-[13px] font-medium', stat.isAI ? 'text-on-secondary-fixed' : 'text-on-surface')}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  </View>
);
