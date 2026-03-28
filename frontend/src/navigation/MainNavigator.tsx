import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { RecipeSearchScreen } from '../screens/RecipeSearchScreen';
import { IngredientChecklistScreen } from '../screens/IngredientChecklistScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { MarketMapScreen } from '../screens/MarketMapScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const MainNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="RecipeSearch" component={RecipeSearchScreen} />
    <Stack.Screen name="IngredientChecklist" component={IngredientChecklistScreen} />
    <Stack.Screen name="Inventory" component={InventoryScreen} />
    <Stack.Screen
      name="MarketMap"
      component={MarketMapScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);
