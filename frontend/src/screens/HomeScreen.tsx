import React from 'react';
import { View, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../components/AppHeader';
import { HeroSection } from '../components/HeroSection';
import { RecommendationsSection } from '../components/RecommendationsSection';
import { HistorySection } from '../components/HistorySection';
import { BottomNavBar } from '../components/BottomNavBar';
import { FAB } from '../components/FAB';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();

  const handleRecipePress = (recipeId: string, recipeTitle: string) => {
    navigation.navigate('IngredientChecklist', { recipeId, recipeTitle });
  };

  const handleTabPress = (tabId: string) => {
    if (tabId === 'inventory') navigation.navigate('IngredientChecklist', {});
    if (tabId === 'stores') navigation.navigate('MarketMap');
    if (tabId === 'route') navigation.navigate('ShoppingMap');
  };

  return (
    <View
      className="flex-1 bg-surface"
      style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0 }}
    >
      <StatusBar style="dark" />
      <AppHeader />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <HeroSection />
        <RecommendationsSection onRecipePress={handleRecipePress} />
        <HistorySection onRecipePress={handleRecipePress} />
      </ScrollView>
      <BottomNavBar initialActive="cook" onTabPress={handleTabPress} />
      <FAB onPress={() => console.log('Quick assist')} />
    </View>
  );
};
