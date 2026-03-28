import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const AppHeader: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 12,
        paddingHorizontal: 24,
        backgroundColor: '#f7fbf0',
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: '800',
          color: '#0d631b',
          letterSpacing: -0.3,
        }}
      >
        MealMate
      </Text>
    </View>
  );
};
