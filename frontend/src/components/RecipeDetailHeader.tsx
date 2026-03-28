import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RecipeDetailHeaderProps {
  onBack?: () => void;
  onFavorite?: () => void;
}

const AVATAR_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOjR5iqLMcMYuOXfKZpYov80SYMQXWDCnzMq_5jFFpWN4njRNXmAgDMehR_hniGNm8C6FQpDJ885YsJnRwsJPWzdmWzlPwj5IUhgPcG0BJt2gS-x2VOBrmD3PeX0U2AdNnCaj7DGYItSTc-3rf1fkmUSc54G-oXLYsLgAZApthV_g69jKXf7HRrsscsbFW5rM-Ie_3bfZZVm_IoqjnfikxpDluGszbmzkSLvem6PfBW7WzsaQRNjuzBqFJ1mdPOisoU5qSpHnKDAw';

export const RecipeDetailHeader: React.FC<RecipeDetailHeaderProps> = ({ onBack, onFavorite }) => (
  <View className="flex-row items-center justify-between px-6 h-16 bg-surface">
    <View className="flex-row items-center gap-2">
      <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center" onPress={onBack} activeOpacity={0.7}>
        <MaterialIcons name="arrow-back" size={22} color="#0d631b" />
      </TouchableOpacity>
      <Text className="text-lg font-extrabold text-primary">MealMate</Text>
    </View>
    <View className="flex-row items-center gap-2">
      <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center" onPress={onFavorite} activeOpacity={0.7}>
        <MaterialIcons name="favorite-border" size={22} color="#94a3b8" />
      </TouchableOpacity>
      <View className="w-8 h-8 rounded-full overflow-hidden bg-primary-fixed">
        <Image source={{ uri: AVATAR_URI }} className="w-8 h-8" />
      </View>
    </View>
  </View>
);
