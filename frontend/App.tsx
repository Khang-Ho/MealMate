import './global.css';
import React from 'react';
import { Text, View } from 'react-native';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { MealHistoryProvider } from './src/context/MealHistoryContext';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function MissingClerkKeyScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-8">
      <Text className="text-center text-lg font-semibold text-on-surface mb-2">Clerk key required</Text>
      <Text className="text-center text-sm text-on-surface-variant leading-6">
        Copy frontend/.env.example to .env and set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY from your Clerk dashboard
        (API keys → Publishable key).
      </Text>
    </View>
  );
}

export default function App() {
  if (!publishableKey) {
    return <MissingClerkKeyScreen />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <MealHistoryProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </MealHistoryProvider>
    </ClerkProvider>
  );
}
