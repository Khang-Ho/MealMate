import React from 'react';
import { View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { RecipeDetailHeader } from '../components/RecipeDetailHeader';
import { RecipeHero } from '../components/RecipeHero';
import { RecipeSteps } from '../components/RecipeSteps';
import { IngredientInventory } from '../components/IngredientInventory';
import { BottomNavBar } from '../components/BottomNavBar';

export const RecipeDetailScreen: React.FC = () => (
  <View className="flex-1 bg-surface">
    <StatusBar style="dark" />
    <RecipeDetailHeader onBack={() => console.log('go back')} onFavorite={() => console.log('toggle favorite')} />
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <RecipeHero />
      <RecipeSteps />
      <IngredientInventory />
    </ScrollView>
    <BottomNavBar />
  </View>
);
