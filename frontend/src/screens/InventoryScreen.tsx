import React, { useState } from 'react';
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
import clsx from 'clsx';
import { RootStackParamList } from '../navigation/types';
import { useMealHistory, CookedMeal, FavouriteRecipe } from '../context/MealHistoryContext';
import { BottomNavBar } from '../components/BottomNavBar';
import { AppHeader } from '../components/AppHeader';

type InventoryNavProp = NativeStackNavigationProp<RootStackParamList, 'Inventory'>;

type TabId = 'history' | 'favourites';

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function CookedMealRow({ meal, onPress, onRemove }: { meal: CookedMeal; onPress: () => void; onRemove: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      className="flex-row items-center gap-3.5 bg-surface-container-lowest rounded-2xl p-3.5 mb-3"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-surface-container">
        {meal.image ? (
          <Image source={{ uri: meal.image }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="restaurant" size={28} color="#707a6c" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1">
          <MaterialIcons name="check-circle" size={13} color="#0d631b" />
          <Text className="text-[10px] font-bold text-primary uppercase tracking-[0.8px]">Cooked</Text>
        </View>
        <Text className="text-[14px] font-bold text-on-surface mb-0.5" numberOfLines={2}>{meal.title}</Text>
        <Text className="text-[12px] text-on-surface-variant">{timeAgo(meal.cookedAt)}</Text>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="w-8 h-8 rounded-full bg-surface-container items-center justify-center"
      >
        <MaterialIcons name="close" size={16} color="#94a3b8" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function FavouriteRow({ recipe, onPress, onRemove }: { recipe: FavouriteRecipe; onPress: () => void; onRemove: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      className="flex-row items-center gap-3.5 bg-surface-container-lowest rounded-2xl p-3.5 mb-3"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-surface-container">
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="restaurant" size={28} color="#707a6c" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1">
          <MaterialIcons name="favorite" size={13} color="#e11d48" />
          <Text className="text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: '#e11d48' }}>Favourite</Text>
        </View>
        <Text className="text-[14px] font-bold text-on-surface" numberOfLines={2}>{recipe.title}</Text>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="w-8 h-8 rounded-full bg-surface-container items-center justify-center"
      >
        <MaterialIcons name="close" size={16} color="#94a3b8" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export const InventoryScreen: React.FC = () => {
  const navigation = useNavigation<InventoryNavProp>();
  const { cookedMeals, favourites, toggleFavourite } = useMealHistory();
  const [activeTab, setActiveTab] = useState<TabId>('history');

  const handleTabPress = (tabId: string) => {
    if (tabId === 'cook') navigation.navigate('Home');
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

      {/* Sub-title */}
      <View className="px-6 pt-2 pb-3">
        <Text className="text-[22px] font-extrabold text-on-surface">My Kitchen</Text>
        <Text className="text-[13px] text-on-surface-variant mt-0.5">Your cooking history & saved recipes</Text>
      </View>

      {/* Tab switcher */}
      <View className="flex-row mx-6 mb-5 bg-surface-container-low rounded-2xl p-1">
        {([
          { id: 'history' as TabId, label: 'Cooked Meals', icon: 'restaurant' as const },
          { id: 'favourites' as TabId, label: 'Favourites', icon: 'favorite' as const },
        ] as const).map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.8}
            className={clsx(
              'flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl',
              activeTab === tab.id ? 'bg-white' : '',
            )}
            style={activeTab === tab.id ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 } : undefined}
          >
            <MaterialIcons
              name={tab.icon}
              size={16}
              color={activeTab === tab.id ? '#0d631b' : '#94a3b8'}
            />
            <Text className={clsx('text-[13px] font-semibold', activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant')}>
              {tab.label}
            </Text>
            {tab.id === 'history' && cookedMeals.length > 0 && (
              <View className="bg-primary rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-white text-[10px] font-bold">{cookedMeals.length}</Text>
              </View>
            )}
            {tab.id === 'favourites' && favourites.length > 0 && (
              <View className="bg-rose-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-white text-[10px] font-bold">{favourites.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'history' ? (
          cookedMeals.length === 0 ? (
            <View className="items-center justify-center py-20 gap-3">
              <MaterialIcons name="restaurant-menu" size={56} color="#e2e8f0" />
              <Text className="text-[17px] font-bold text-on-surface text-center">No cooked meals yet</Text>
              <Text className="text-[13px] text-on-surface-variant text-center px-4">
                When you finish cooking a recipe, tap "Mark as Cooked" and it'll appear here.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                className="bg-primary px-6 py-3 rounded-full mt-2"
                activeOpacity={0.85}
              >
                <Text className="text-white font-semibold">Explore Recipes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-[13px] text-on-surface-variant mb-4">{cookedMeals.length} meal{cookedMeals.length !== 1 ? 's' : ''} cooked</Text>
              {cookedMeals.map((meal) => (
                <CookedMealRow
                  key={`${meal.id}-${meal.cookedAt.getTime()}`}
                  meal={meal}
                  onPress={() => goToChecklist(meal.id, meal.title, meal.image)}
                  onRemove={() => {
                    // We don't expose a remove from context, so we can add it or skip
                    // For now, this is a no-op placeholder
                  }}
                />
              ))}
            </>
          )
        ) : (
          favourites.length === 0 ? (
            <View className="items-center justify-center py-20 gap-3">
              <MaterialIcons name="favorite-border" size={56} color="#e2e8f0" />
              <Text className="text-[17px] font-bold text-on-surface text-center">No favourites yet</Text>
              <Text className="text-[13px] text-on-surface-variant text-center px-4">
                Tap the heart icon on any recipe to save it here for quick access.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                className="bg-primary px-6 py-3 rounded-full mt-2"
                activeOpacity={0.85}
              >
                <Text className="text-white font-semibold">Browse Recipes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-[13px] text-on-surface-variant mb-4">{favourites.length} saved recipe{favourites.length !== 1 ? 's' : ''}</Text>
              {favourites.map((recipe) => (
                <FavouriteRow
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() => goToChecklist(recipe.id, recipe.title, recipe.image)}
                  onRemove={() => toggleFavourite(recipe)}
                />
              ))}
            </>
          )
        )}
      </ScrollView>

      <BottomNavBar initialActive="inventory" onTabPress={handleTabPress} />
    </View>
  );
};
