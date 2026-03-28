import React from 'react';
import { View, Text } from 'react-native';

export const AppHeader: React.FC = () => (
  <View className="flex-row items-center px-6 h-16 bg-surface">
    <Text className="text-xl font-extrabold text-primary">MealMate</Text>
  </View>
);
