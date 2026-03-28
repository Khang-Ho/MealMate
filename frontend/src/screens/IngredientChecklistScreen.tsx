import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';
import { RootStackParamList } from '../navigation/types';
import { useRecipeIngredients, RecipeIngredient } from '../hooks/useRecipeIngredients';
import { BottomNavBar } from '../components/BottomNavBar';
import { useMealHistory } from '../context/MealHistoryContext';
import { StreakCelebrationModal } from '../components/StreakCelebrationModal';

type ChecklistNavProp = NativeStackNavigationProp<RootStackParamList, 'IngredientChecklist'>;
type ChecklistRouteProp = RouteProp<RootStackParamList, 'IngredientChecklist'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = Math.round((SCREEN_WIDTH - 48) * (9 / 16));
const PLACEHOLDER_IMG = 'https://spoonacular.com/recipeImages/716429-312x231.jpg';
const INGREDIENT_IMG_BASE = 'https://spoonacular.com/cdn/ingredients_100x100/';

function IngredientRow({
  item,
  checked,
  onToggle,
}: {
  item: RecipeIngredient;
  checked: boolean;
  onToggle: () => void;
}) {
  const imgUri = item.image ?? `${INGREDIENT_IMG_BASE}${item.name.toLowerCase().replace(/ /g, '-')}.jpg`;

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      className={clsx(
        'flex-row items-center gap-3.5 rounded-2xl p-3.5 mb-2.5',
        checked
          ? 'bg-secondary-fixed/30 border border-primary/20'
          : 'bg-surface-container-lowest border-l-4 border-error',
      )}
      style={
        !checked
          ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }
          : undefined
      }
    >
      {/* Ingredient image */}
      <Image
        source={{ uri: imgUri }}
        className="w-11 h-11 rounded-xl bg-surface-container"
        resizeMode="cover"
      />

      {/* Text */}
      <View className="flex-1">
        <Text
          className={clsx(
            'text-[14px] font-bold mb-0.5',
            checked ? 'text-on-surface/60 line-through' : 'text-on-surface',
          )}
        >
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
        </Text>
        <Text className="text-[12px] text-on-surface-variant" numberOfLines={1}>
          {item.original}
        </Text>
      </View>

      {/* Checkbox */}
      <View
        className={clsx(
          'w-7 h-7 rounded-full items-center justify-center border-2',
          checked ? 'bg-primary border-primary' : 'border-outline bg-surface',
        )}
      >
        {checked && <MaterialIcons name="check" size={16} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

export const IngredientChecklistScreen: React.FC = () => {
  const navigation = useNavigation<ChecklistNavProp>();
  const route = useRoute<ChecklistRouteProp>();
  const { recipeId, recipeTitle, recipeImage } = route.params;

  const { detail, loading, error } = useRecipeIngredients(recipeId ?? null);
  const { markAsCooked, toggleFavourite, isFavourite, setRecentRecipe } = useMealHistory();

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [cooked, setCooked] = useState(false);
  const [streakData, setStreakData] = useState({ visible: false, streak: 0 });

  // Record as recently viewed as soon as we land here
  useEffect(() => {
    if (recipeId && recipeTitle) {
      setRecentRecipe({ id: recipeId, title: recipeTitle, image: recipeImage ?? null });
    }
  }, [recipeId, recipeTitle, recipeImage, setRecentRecipe]);

  const favourite = isFavourite(recipeId);

  const handleMarkCooked = async () => {
    setCooked(true);
    const result = await markAsCooked({ id: recipeId, title: recipeTitle, image: recipeImage ?? null });
    if (result.streakIncreased) {
      setStreakData({ visible: true, streak: result.newStreak });
    }
  };

  const handleToggleFavourite = () => {
    toggleFavourite({ id: recipeId, title: recipeTitle, image: recipeImage ?? null });
  };

  const toggleItem = useCallback((key: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const ingredients = detail?.ingredients ?? [];
  // Use index in the key so duplicate Spoonacular ingredient IDs don't collide
  const itemKey = (ing: RecipeIngredient, idx: number) =>
    `${idx}-${ing.id ?? ing.name}`;

  const { haveList, needList } = useMemo(() => {
    const haveList: Array<{ ing: RecipeIngredient; key: string }> = [];
    const needList: Array<{ ing: RecipeIngredient; key: string }> = [];
    ingredients.forEach((ing, idx) => {
      const k = itemKey(ing, idx);
      if (checkedIds.has(k)) haveList.push({ ing, key: k });
      else needList.push({ ing, key: k });
    });
    return { haveList, needList };
  }, [ingredients, checkedIds]);

  const handleTabPress = (tabId: string) => {
    if (tabId === 'cook') navigation.navigate('Home');
    if (tabId === 'inventory') navigation.navigate('Inventory');
    if (tabId === 'stores') navigation.navigate('MarketMap', undefined);
    if (tabId === 'settings') navigation.navigate('Settings');
  };

  const heroImage = recipeImage ?? detail?.image ?? PLACEHOLDER_IMG;
  const cookTime = detail?.ready_in_minutes ? `${detail.ready_in_minutes} min` : null;
  const servings = detail?.servings ? `Serves ${detail.servings}` : null;

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="light" />

      {/* Floating header */}
      <View
        className="absolute left-0 right-0 z-10 flex-row items-center justify-between px-5 pb-3"
        style={{ top: 0, paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
          activeOpacity={0.8}
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleToggleFavourite}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
          activeOpacity={0.8}
        >
          <MaterialIcons name={favourite ? 'favorite' : 'favorite-border'} size={22} color={favourite ? '#fb7185' : '#fff'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <View
          className="mx-6 mt-6 mb-6 rounded-3xl overflow-hidden"
          style={{
            height: HERO_HEIGHT,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.14,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Image source={{ uri: heroImage }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
          <View className="absolute bottom-0 left-0 right-0 p-5" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
            <Text className="text-[10px] font-bold text-primary-fixed uppercase tracking-[1.5px] mb-1.5">
              Ingredient Checklist
            </Text>
            <Text className="text-[21px] font-extrabold text-white mb-2.5" numberOfLines={2}>
              {recipeTitle}
            </Text>
            <View className="flex-row gap-4">
              {cookTime && (
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="schedule" size={15} color="rgba(255,255,255,0.9)" />
                  <Text className="text-[12px]" style={{ color: 'rgba(255,255,255,0.9)' }}>{cookTime}</Text>
                </View>
              )}
              {servings && (
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="restaurant" size={15} color="rgba(255,255,255,0.9)" />
                  <Text className="text-[12px]" style={{ color: 'rgba(255,255,255,0.9)' }}>{servings}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Body */}
        {loading ? (
          <View className="items-center justify-center py-16 gap-3">
            <ActivityIndicator size="large" color="#0d631b" />
            <Text className="text-on-surface-variant text-sm">Loading ingredients…</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center px-8 py-12 gap-3">
            <MaterialIcons name="wifi-off" size={44} color="#ba1a1a" />
            <Text className="text-center text-on-surface-variant">{error}</Text>
          </View>
        ) : (
          <View className="px-6">
            {/* Progress bar */}
            {ingredients.length > 0 && (
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-semibold text-on-surface">
                    {checkedIds.size} / {ingredients.length} in pantry
                  </Text>
                  <Text className="text-xs text-on-surface-variant">
                    {needList.length} to buy
                  </Text>
                </View>
                <View className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <View
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${(checkedIds.size / ingredients.length) * 100}%` }}
                  />
                </View>
              </View>
            )}

            {/* Tap hint */}
            <View className="flex-row items-center gap-2 mb-4 bg-primary/8 rounded-xl px-4 py-3">
              <MaterialIcons name="touch-app" size={18} color="#0d631b" />
              <Text className="text-[13px] text-primary flex-1">
                Tap an ingredient to mark it as already in your pantry
              </Text>
            </View>

            {/* Need to buy */}
            {needList.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between px-1 mb-3">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="shopping-cart" size={18} color="#ba1a1a" />
                    <Text className="text-[15px] font-bold text-on-surface">Need to Buy</Text>
                  </View>
                  <View className="bg-error-container px-2.5 py-1 rounded-full">
                    <Text className="text-[11px] font-bold text-on-error-container">
                      {needList.length} Items
                    </Text>
                  </View>
                </View>
                {needList.map(({ ing, key }) => (
                  <IngredientRow
                    key={key}
                    item={ing}
                    checked={false}
                    onToggle={() => toggleItem(key)}
                  />
                ))}
              </View>
            )}

            {/* In pantry */}
            {haveList.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center gap-2 px-1 mb-3">
                  <MaterialIcons name="kitchen" size={18} color="#0d631b" />
                  <Text className="text-[15px] font-bold text-on-surface">In Pantry</Text>
                  <Text className="text-xs italic text-on-surface-variant">Already have</Text>
                </View>
                {haveList.map(({ ing, key }) => (
                  <IngredientRow
                    key={key}
                    item={ing}
                    checked
                    onToggle={() => toggleItem(key)}
                  />
                ))}
              </View>
            )}

            {/* Actions */}
            <View className="gap-3 mt-2">
              {needList.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('MarketMap', {
                      missingIngredients: needList.map(({ ing }) => ing.name),
                    })
                  }
                  className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-primary"
                  activeOpacity={0.85}
                  style={{ shadowColor: '#0d631b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 }}
                >
                  <MaterialIcons name="store" size={20} color="#fff" />
                  <Text className="text-white font-bold text-[15px]">
                    Find Nearby Stores ({needList.length} items)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Mark as Cooked */}
              {ingredients.length > 0 && (
                cooked ? (
                  <View className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-primary/10 border border-primary/30">
                    <MaterialIcons name="check-circle" size={22} color="#0d631b" />
                    <Text className="text-primary font-bold text-[15px]">Saved to Cooked Meals!</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleMarkCooked}
                    className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border-2 border-primary"
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="restaurant-menu" size={20} color="#0d631b" />
                    <Text className="text-primary font-bold text-[15px]">Mark as Cooked</Text>
                  </TouchableOpacity>
                )
              )}

              {/* Favourite shortcut */}
              <TouchableOpacity
                onPress={handleToggleFavourite}
                className={clsx(
                  'flex-row items-center justify-center gap-2 py-3.5 rounded-2xl',
                  favourite ? 'bg-rose-50 border border-rose-200' : 'bg-surface-container-low border border-outline-variant/50',
                )}
                activeOpacity={0.85}
              >
                <MaterialIcons name={favourite ? 'favorite' : 'favorite-border'} size={18} color={favourite ? '#e11d48' : '#707a6c'} />
                <Text className={clsx('font-semibold text-[14px]', favourite ? 'text-rose-600' : 'text-on-surface-variant')}>
                  {favourite ? 'Saved to Favourites' : 'Save to Favourites'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNavBar initialActive="inventory" onTabPress={handleTabPress} />

      <StreakCelebrationModal
        visible={streakData.visible}
        streak={streakData.streak}
        onClose={() => setStreakData((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
