import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MapHeaderProps {
  onBack?: () => void;
}

const AVATAR_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCUTI5V019A_r9StwYJC5DAq0lKIN1cFNHul0AqqOssBNbPSN5AmUawdutFGTsfS3eA8mKwwW5RjxT8TX-7dxkZm1FdiHWnuWHAU72Q7KpWL6-aGZlVpPIJ8esSAbB8NC9P7up2A9whBvAWnJTVc3tcg-NGzfuUHgkkF07pgUxo3--fsvPSFLJsTrN47VjbYDj65oEB3T2xNLT6W83b2dc5OPh59fzJJ5_PrDf4Q5l2tb96xfOTzPJqbLGThvjkJYeOOGxBA7p9nO0';

export const MAP_HEADER_HEIGHT = 64;
const EXTRA_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

export const MapHeader: React.FC<MapHeaderProps> = ({ onBack }) => (
  <View
    className="absolute left-0 right-0 h-16 flex-row items-center justify-between px-6 border-b z-50"
    style={{ top: EXTRA_TOP, backgroundColor: 'rgba(255,255,255,0.92)', borderBottomColor: 'rgba(191,202,186,0.2)' }}
  >
    <View className="flex-row items-center gap-2.5">
      <TouchableOpacity className="w-9 h-9 rounded-full bg-surface-container-low items-center justify-center" onPress={onBack} activeOpacity={0.7}>
        <MaterialIcons name="arrow-back" size={20} color="#0d631b" />
      </TouchableOpacity>
      <Text className="text-lg font-extrabold text-primary">MealMate</Text>
    </View>
    <View className="w-9 h-9 rounded-full overflow-hidden bg-primary-fixed border-2 border-surface-container-highest">
      <Image source={{ uri: AVATAR_URI }} className="w-9 h-9" />
    </View>
  </View>
);
