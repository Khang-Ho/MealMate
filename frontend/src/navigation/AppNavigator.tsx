import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { IngredientChecklistScreen } from '../screens/IngredientChecklistScreen';
import { MarketMapScreen } from '../screens/MarketMapScreen';
import { ShoppingMapScreen } from '../screens/ShoppingMapScreen';

export type RootStackParamList = {
  Home: undefined;
  IngredientChecklist: { recipeId?: string; recipeTitle?: string };
  MarketMap: undefined;
  ShoppingMap: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="IngredientChecklist" component={IngredientChecklistScreen} />
      <Stack.Screen
        name="MarketMap"
        component={MarketMapScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ShoppingMap"
        component={ShoppingMapScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
