import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '../components/AppHeader';
import { RecipeHeroBanner } from '../components/RecipeHeroBanner';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { IngredientsChecklist } from '../components/IngredientsChecklist';
import { RecipeSteps } from '../components/RecipeSteps';
import { ShoppingListCard } from '../components/ShoppingListCard';
import { RoutePreviewCard } from '../components/RoutePreviewCard';
import { BottomNavBar, NavTab } from '../components/BottomNavBar';
import { RecipeStep } from '../types/recipe';

const TABS: NavTab[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory' },
  { id: 'route', label: 'Route', icon: 'map' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAb-Y8TbZqDZ03GR9vRhDK6Zs9f3qzQm7o8q3SHCs9FIU6VOVWFdBefN878qnyOX380ObcJPi2BNYn_P53QxxaxrcFQoJqUKraxP1zM8A68zPIsnidW5ALdEZkVRiMhCFuIxcuVtMSSC5r9_gF0N74ghJR9XUZMnBQWXsNygz0WJoWdTPPCIuCvi6-71cp-RitxI-YS8tX2G2fAnNDDAqDtxUkKKCXUF6qkrFvy--_WlfCS18dcS6ghsBKjkyz2QkZIdk7pBCibbFY';

const STEPS: RecipeStep[] = [
  { number: 1, title: 'Prep and Preheat', description: 'Preheat your oven to 400°F (200°C). Line a large baking sheet with parchment paper for easy cleanup. Snap off the woody ends of the asparagus.' },
  { number: 2, title: 'Season the Salmon', description: 'Place salmon fillets and asparagus on the baking sheet. Drizzle with olive oil, lemon zest, salt, and pepper. Rub the herbs gently into the salmon flesh.' },
  { number: 3, title: 'Roast to Perfection', description: 'Roast for 12-15 minutes until the salmon is opaque and flakes easily with a fork. The asparagus should be tender-crisp and slightly charred.' },
];

export const RecipeShoppingScreen: React.FC = () => (
  <View className="flex-1 bg-surface">
    <StatusBar style="dark" />
    <AppHeader />
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <RecipeHeroBanner
        imageUri={HERO_IMAGE}
        tags={['Mediterranean', 'AI Recommended']}
        title="Herbed Salmon with Asparagus"
        cookTime="25 mins"
        difficulty="Intermediate"
      />
      <View className="px-5 pt-6 gap-6">
        <AIAnalysisCard />
        <View className="h-px bg-outline-variant opacity-40" />
        <IngredientsChecklist />
        <View className="h-px bg-outline-variant opacity-40" />
        <View>
          <Text className="text-[26px] font-extrabold text-on-surface mb-4">Instructions</Text>
          <RecipeSteps steps={STEPS} title="Instructions" />
        </View>
        <View className="h-px bg-outline-variant opacity-40" />
        <ShoppingListCard onAddToRoute={() => console.log('add to route')} />
        <RoutePreviewCard />
      </View>
      <View className="h-24" />
    </ScrollView>
    <BottomNavBar tabs={TABS} initialActive="route" />
  </View>
);
