import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Tag } from '../types/recipe';

interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl: string;
  tags?: Tag[];
  onPress?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ title, imageUrl, tags, onPress }) => (
  <TouchableOpacity
    className="flex-1 bg-surface-container-lowest rounded-xl overflow-hidden"
    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}
    activeOpacity={0.9}
    onPress={onPress}
  >
    <Image source={{ uri: imageUrl }} className="w-full h-[110px]" resizeMode="cover" />
    <View className="p-3">
      <Text className="text-[13px] font-bold text-on-surface mb-2 leading-[18px]" numberOfLines={2}>
        {title}
      </Text>
      {tags && tags.length > 0 && (
        <View className="flex-row gap-1 flex-wrap">
          {tags.map((tag, i) => (
            <View key={i} className="px-2 py-0.5 rounded-full" style={{ backgroundColor: tag.bgColor }}>
              <Text className="text-[9px] font-bold tracking-[0.3px]" style={{ color: tag.textColor }}>
                {tag.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  </TouchableOpacity>
);
