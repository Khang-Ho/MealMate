import React from 'react';
import { View, Text, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';

interface RecipeHeroBannerProps {
  imageUri: string;
  tags?: string[];
  title: string;
  cookTime?: string;
  difficulty?: string;
}

export const RecipeHeroBanner: React.FC<RecipeHeroBannerProps> = ({
  imageUri,
  tags = [],
  title,
  cookTime,
  difficulty,
}) => (
  <View className="w-full h-[320px] overflow-hidden">
    <Image source={{ uri: imageUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />

    {/* Gradient simulation */}
    <View className="absolute top-0 left-0 right-0 h-20" style={{ backgroundColor: 'rgba(24,29,23,0.15)' }} />
    <View className="absolute bottom-0 left-0 right-0 h-[65%]" style={{ backgroundColor: 'rgba(24,29,23,0.65)' }} />

    {/* Content */}
    <View className="absolute bottom-0 left-0 right-0 p-6">
      {tags.length > 0 && (
        <View className="flex-row gap-2 mb-3 flex-wrap">
          {tags.map((tag, i) => (
            <View key={i} className={clsx('px-3 py-1 rounded-full', i === 1 ? 'bg-secondary-container' : 'bg-primary-fixed')}>
              <Text className={clsx('text-[10px] font-bold uppercase tracking-[0.8px]', i === 1 ? 'text-on-secondary-container' : 'text-on-primary-fixed')}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text className="text-[28px] font-extrabold text-white leading-[34px] mb-3">{title}</Text>

      {(cookTime || difficulty) && (
        <View className="flex-row gap-5">
          {cookTime && (
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="schedule" size={18} color="rgba(255,255,255,0.9)" />
              <Text className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>{cookTime}</Text>
            </View>
          )}
          {difficulty && (
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="signal-cellular-alt" size={18} color="rgba(255,255,255,0.9)" />
              <Text className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>{difficulty}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  </View>
);
