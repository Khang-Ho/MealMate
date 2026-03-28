import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useMealHistory } from '../context/MealHistoryContext';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { favourites, toggleFavourite, cookedMeals } = useMealHistory();

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    primaryEmail ||
    'MealMate member';

  const handleOpenPrivacy = () => {
    Linking.openURL('https://clerk.com/legal/privacy').catch(() => undefined);
  };

  return (
    <View
      className="flex-1 bg-surface"
      style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0 }}
    >
      <StatusBar style="dark" />

      <View className="flex-row items-center px-4 h-14 border-b border-outline-variant/40 bg-surface">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-high"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0d631b" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-on-surface pr-10">Profile & settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-8 pb-6">
          <View className="items-center">
            <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-fixed bg-surface-container-high mb-4">
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} className="w-full h-full" />
              ) : (
                <View className="flex-1 items-center justify-center bg-primary-container">
                  <MaterialIcons name="person" size={48} color="#cbffc2" />
                </View>
              )}
            </View>
            <Text className="text-xl font-bold text-on-surface text-center">{displayName}</Text>
            {primaryEmail ? (
              <Text className="text-sm text-on-surface-variant mt-1 text-center">{primaryEmail}</Text>
            ) : null}
            {!isLoaded ? (
              <Text className="text-xs text-on-surface-variant mt-2">Loading account…</Text>
            ) : null}
          </View>
        </View>

        {/* Stats strip */}
        <View className="flex-row mx-6 mb-6 gap-3">
          <View className="flex-1 bg-primary/8 rounded-2xl py-4 items-center">
            <Text className="text-[22px] font-extrabold text-primary">{cookedMeals.length}</Text>
            <Text className="text-[11px] text-on-surface-variant mt-0.5">Meals Cooked</Text>
          </View>
          <View className="flex-1 bg-rose-50 rounded-2xl py-4 items-center">
            <Text className="text-[22px] font-extrabold" style={{ color: '#e11d48' }}>{favourites.length}</Text>
            <Text className="text-[11px] text-on-surface-variant mt-0.5">Favourites</Text>
          </View>
        </View>

        {/* Favourites list */}
        {favourites.length > 0 && (
          <View className="px-6 mb-8">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Saved Favourites</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Inventory')} activeOpacity={0.7}>
                <Text className="text-[12px] font-semibold text-primary">See all</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-2">
              {favourites.slice(0, 3).map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  onPress={() => navigation.navigate('IngredientChecklist', { recipeId: recipe.id, recipeTitle: recipe.title, recipeImage: recipe.image ?? undefined })}
                  activeOpacity={0.85}
                  className="flex-row items-center gap-3 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/40"
                >
                  <View className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container">
                    {recipe.image ? (
                      <Image source={{ uri: recipe.image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <MaterialIcons name="restaurant" size={22} color="#707a6c" />
                      </View>
                    )}
                  </View>
                  <Text className="flex-1 text-[14px] font-semibold text-on-surface" numberOfLines={1}>{recipe.title}</Text>
                  <TouchableOpacity onPress={() => toggleFavourite(recipe)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons name="favorite" size={18} color="#e11d48" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="px-6 gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Account</Text>
          <SettingsRow
            icon="notifications-none"
            label="Notifications"
            hint="Recipe alerts & store stock"
            onPress={() => undefined}
            disabled
          />
          <SettingsRow
            icon="lock-outline"
            label="Privacy & data"
            hint="Opens Clerk privacy (example)"
            onPress={handleOpenPrivacy}
          />
        </View>

        <View className="px-6 mt-8">
          <TouchableOpacity
            onPress={() => signOut()}
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-error/12 border border-error/25 active:opacity-90"
          >
            <MaterialIcons name="logout" size={22} color="#ba1a1a" />
            <Text className="text-base font-semibold text-error">Sign out</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-xs text-on-surface-variant mt-10 px-8">
          MealMate · Plan smarter shops with pantry-aware routing
        </Text>
      </ScrollView>
    </View>
  );
};

function SettingsRow(props: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  hint?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { icon, label, hint, onPress, disabled } = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={clsx(
        'flex-row items-center px-4 py-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50',
        disabled && 'opacity-50'
      )}
    >
      <View className="w-10 h-10 rounded-full bg-primary-fixed/40 items-center justify-center mr-3">
        <MaterialIcons name={icon} size={22} color="#0d631b" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-on-surface">{label}</Text>
        {hint ? <Text className="text-xs text-on-surface-variant mt-0.5">{hint}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#707a6c" />
    </TouchableOpacity>
  );
}
