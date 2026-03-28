import React from 'react';
import { View, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeDetailHeader } from '../components/RecipeDetailHeader';
import { DishHero } from '../components/DishHero';
import { MissingIngredientsList } from '../components/MissingIngredientsList';
import { AvailableIngredientsList } from '../components/AvailableIngredientsList';
import { ChecklistActions } from '../components/ChecklistActions';
import { BottomNavBar } from '../components/BottomNavBar';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChecklistNavProp = NativeStackNavigationProp<RootStackParamList, 'IngredientChecklist'>;

export const IngredientChecklistScreen: React.FC = () => {
  const navigation = useNavigation<ChecklistNavProp>();

  const handleTabPress = (tabId: string) => {
    if (tabId === 'cook') navigation.navigate('Home');
    if (tabId === 'stores') navigation.navigate('MarketMap');
    if (tabId === 'route') navigation.navigate('ShoppingMap');
  };

  return (
    <View
      className="flex-1 bg-surface"
      style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0 }}
    >
      <StatusBar style="dark" />
      <RecipeDetailHeader onBack={() => navigation.goBack()} onFavorite={() => console.log('fav')} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <DishHero />
        <View className="px-6">
          <MissingIngredientsList onAddToCart={(item) => console.log('add to cart:', item.name)} />
          <AvailableIngredientsList />
        </View>
        <ChecklistActions onFindNearby={() => navigation.navigate('MarketMap')} onSync={() => console.log('sync refrigerator')} />
      </ScrollView>
      <BottomNavBar initialActive="inventory" onTabPress={handleTabPress} />
    </View>
  );
};
