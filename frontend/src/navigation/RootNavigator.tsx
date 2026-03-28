import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import { MainNavigator } from './MainNavigator';
import { AuthNavigator } from './AuthNavigator';

export const RootNavigator: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#0d631b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isSignedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
