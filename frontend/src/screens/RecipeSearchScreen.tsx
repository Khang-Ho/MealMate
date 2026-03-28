import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useRecipeSearch, RecipeResult } from '../hooks/useRecipeSearch';

type SearchNavProp = NativeStackNavigationProp<RootStackParamList, 'RecipeSearch'>;
type SearchRouteProp = RouteProp<RootStackParamList, 'RecipeSearch'>;

const PLACEHOLDER = 'https://spoonacular.com/recipeImages/716429-312x231.jpg';

function RecipeCard({
  item,
  onPress,
}: {
  item: RecipeResult;
  onPress: () => void;
}) {
  const diets = item.diets.slice(0, 2);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="flex-row bg-surface-container-lowest rounded-2xl mb-3 overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: item.image ?? PLACEHOLDER }}
        className="w-24 h-24"
        resizeMode="cover"
      />
      <View className="flex-1 p-3.5 justify-between">
        <Text className="text-[14px] font-bold text-on-surface leading-5" numberOfLines={2}>
          {item.title}
        </Text>
        <View className="flex-row items-center gap-3 mt-2 flex-wrap">
          {item.ready_in_minutes != null && (
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="schedule" size={12} color="#707a6c" />
              <Text className="text-[11px] text-on-surface-variant">{item.ready_in_minutes} min</Text>
            </View>
          )}
          {item.servings != null && (
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="people" size={12} color="#707a6c" />
              <Text className="text-[11px] text-on-surface-variant">{item.servings} servings</Text>
            </View>
          )}
        </View>
        {diets.length > 0 && (
          <View className="flex-row gap-1.5 mt-2 flex-wrap">
            {diets.map((d) => (
              <View key={d} className="bg-secondary-fixed/60 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-semibold text-on-surface-variant capitalize">{d}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View className="justify-center pr-3">
        <MaterialIcons name="chevron-right" size={20} color="#707a6c" />
      </View>
    </TouchableOpacity>
  );
}

export const RecipeSearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchNavProp>();
  const route = useRoute<SearchRouteProp>();
  const { query = '', cuisine = '' } = route.params ?? {};
  const { results, loading, error, totalResults, search } = useRecipeSearch();

  useEffect(() => {
    if (query) {
      search(query, cuisine || undefined);
    }
  }, [query, cuisine, search]);

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />

      {/* Header */}
      <View
        className="flex-row items-center px-5 pb-3 gap-3"
        style={{ paddingTop: insets.top + 6 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-surface-container items-center justify-center"
          activeOpacity={0.8}
        >
          <MaterialIcons name="arrow-back" size={22} color="#1a1c19" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[18px] font-bold text-on-surface" numberOfLines={1}>
            Results for "{query}"
          </Text>
          {!loading && totalResults > 0 && (
            <Text className="text-[12px] text-on-surface-variant">
              {totalResults} recipes found
              {cuisine ? ` · ${cuisine}` : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#0d631b" />
          <Text className="text-on-surface-variant text-sm">Finding recipes…</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <MaterialIcons name="wifi-off" size={52} color="#ba1a1a" />
          <Text className="text-center text-on-surface-variant text-base">{error}</Text>
          <TouchableOpacity
            onPress={() => search(query, cuisine || undefined)}
            className="bg-primary px-6 py-3 rounded-full"
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 gap-3">
          <MaterialIcons name="search-off" size={52} color="#707a6c" />
          <Text className="text-on-surface text-lg font-bold text-center">No results found</Text>
          <Text className="text-on-surface-variant text-sm text-center">
            Try a different query or remove the cuisine filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RecipeCard
              item={item}
              onPress={() =>
                navigation.navigate('IngredientChecklist', {
                  recipeId: item.id,
                  recipeTitle: item.title,
                  recipeImage: item.image ?? undefined,
                })
              }
            />
          )}
        />
      )}
    </View>
  );
};
