import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { HeroSection } from '../components/HeroSection';
import { BottomNavBar } from '../components/BottomNavBar';
import { FAB } from '../components/FAB';
import { RootStackParamList } from '../navigation/types';
import { useMealHistory, CookedMeal } from '../context/MealHistoryContext';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const MUST_TRY = {
  id: 716429,
  title: 'Pasta with Garlic, Scallions & Cauliflower',
  image: 'https://spoonacular.com/recipeImages/716429-312x231.jpg',
  tag: 'EDITOR\'S PICK',
  time: '45 min',
  servings: 2,
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CookedCard({ meal, onPress }: { meal: CookedMeal; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="w-[160px] mr-4"
    >
      <View className="w-[160px] h-[110px] rounded-2xl overflow-hidden mb-2 bg-surface-container">
        {meal.image ? (
          <Image source={{ uri: meal.image }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="restaurant" size={36} color="#707a6c" />
          </View>
        )}
        <View className="absolute top-2 right-2 bg-primary/90 rounded-full px-2 py-0.5">
          <Text className="text-[9px] font-bold text-white">COOKED</Text>
        </View>
      </View>
      <Text className="text-[13px] font-bold text-on-surface" numberOfLines={2}>{meal.title}</Text>
      <Text className="text-[11px] text-on-surface-variant mt-0.5">{timeAgo(meal.cookedAt)}</Text>
    </TouchableOpacity>
  );
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const { cookedMeals, recentRecipe } = useMealHistory();

  const handleSearch = (query: string, cuisine: string) => {
    navigation.navigate('RecipeSearch', { query, cuisine });
  };

  const handleTabPress = (tabId: string) => {
    if (tabId === 'inventory') navigation.navigate('Inventory');
    if (tabId === 'stores') navigation.navigate('MarketMap', undefined);
    if (tabId === 'settings') navigation.navigate('Settings');
  };

  const goToChecklist = (id: number, title: string, image?: string | null) => {
    navigation.navigate('IngredientChecklist', {
      recipeId: id,
      recipeTitle: title,
      recipeImage: image ?? undefined,
    });
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <AppHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <HeroSection onSearch={handleSearch} />

        {/* ── Must Try ── */}
        <View className="px-6 mb-8">
          <View className="flex-row items-end justify-between mb-4">
            <View>
              <Text className="text-[22px] font-bold text-on-surface">Must Try</Text>
              <Text className="text-[13px] text-outline mt-0.5">Hand-picked for you today</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => goToChecklist(MUST_TRY.id, MUST_TRY.title, MUST_TRY.image)}
            activeOpacity={0.92}
            className="rounded-3xl overflow-hidden"
            style={{
              height: 220,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.14,
              shadowRadius: 20,
              elevation: 6,
            }}
          >
            <Image source={{ uri: MUST_TRY.image }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
            <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.48)' }} />
            <View className="absolute top-4 left-4">
              <View className="bg-secondary px-3 py-1 rounded-full">
                <Text className="text-white text-[10px] font-bold tracking-[0.8px]">{MUST_TRY.tag}</Text>
              </View>
            </View>
            <View className="absolute bottom-0 left-0 right-0 p-5">
              <Text className="text-white text-[20px] font-extrabold mb-2.5" numberOfLines={2}>
                {MUST_TRY.title}
              </Text>
              <View className="flex-row gap-4">
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{MUST_TRY.time}</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="restaurant" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>Serves {MUST_TRY.servings}</Text>
                </View>
              </View>
            </View>
            <View className="absolute bottom-4 right-4">
              <View className="bg-white/20 rounded-full p-2">
                <MaterialIcons name="arrow-forward" size={18} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Recent ── */}
        {recentRecipe && (
          <View className="px-6 mb-8">
            <Text className="text-[18px] font-bold text-on-surface mb-3">Continue Cooking</Text>
            <TouchableOpacity
              onPress={() => goToChecklist(recentRecipe.id, recentRecipe.title, recentRecipe.image)}
              activeOpacity={0.88}
              className="flex-row items-center gap-3.5 bg-surface-container-low rounded-2xl p-3.5 border border-outline-variant/40"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
            >
              <View className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container">
                {recentRecipe.image ? (
                  <Image source={{ uri: recentRecipe.image }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <MaterialIcons name="restaurant" size={28} color="#707a6c" />
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-primary uppercase tracking-[0.8px] mb-1">RECENTLY VIEWED</Text>
                <Text className="text-[15px] font-bold text-on-surface" numberOfLines={2}>{recentRecipe.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#707a6c" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Your Cooked Meals ── */}
        {cookedMeals.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-end justify-between px-6 mb-4">
              <View>
                <Text className="text-[22px] font-bold text-on-surface">Your Cooked Meals</Text>
                <Text className="text-[13px] text-outline mt-0.5">Relive your culinary successes</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Inventory')} activeOpacity={0.7}>
                <Text className="text-[13px] font-bold text-primary">See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 0 }}
            >
              {cookedMeals.slice(0, 6).map((meal) => (
                <CookedCard
                  key={meal.id}
                  meal={meal}
                  onPress={() => goToChecklist(meal.id, meal.title, meal.image)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Empty state hint when nothing cooked yet */}
        {cookedMeals.length === 0 && !recentRecipe && (
          <View className="px-6 mb-8">
            <View className="bg-primary/6 rounded-2xl px-5 py-6 items-center gap-2">
              <MaterialIcons name="restaurant-menu" size={36} color="#0d631b" />
              <Text className="text-[15px] font-bold text-on-surface text-center">Start your cooking journey</Text>
              <Text className="text-[13px] text-on-surface-variant text-center">
                Search for a recipe above, cook it, and it'll appear here.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNavBar initialActive="cook" onTabPress={handleTabPress} />
      <FAB onPress={() => navigation.navigate('RecipeSearch', { query: '' })} />
    </View>
  );
};
