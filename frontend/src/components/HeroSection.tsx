import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';

const CUISINE_FILTERS = [
  { id: '', label: 'All', icon: 'restaurant' as const },
  { id: 'Italian', label: 'Italian', icon: 'local-pizza' as const },
  { id: 'Asian', label: 'Asian', icon: 'ramen-dining' as const },
  { id: 'Mexican', label: 'Mexican', icon: 'lunch-dining' as const },
  { id: 'Indian', label: 'Indian', icon: 'local-dining' as const },
  { id: 'Vegetarian', label: 'Veggie', icon: 'eco' as const },
];

interface HeroSectionProps {
  onSearch?: (query: string, cuisine: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('');

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch?.(query.trim(), activeCuisine);
    }
  };

  const handleCuisineSelect = (id: string) => {
    setActiveCuisine(id);
    if (query.trim()) {
      onSearch?.(query.trim(), id);
    }
  };

  return (
    <View className="px-6 pt-8 pb-4">
      <Text className="text-[42px] font-extrabold text-on-surface leading-[48px] mb-3">
        {'What do you\nwant to eat?'}
      </Text>
      <Text className="text-base text-on-surface-variant mb-5 leading-6">
        Search recipes and we'll build your shopping list.
      </Text>

      {/* Search row */}
      <View className="flex-row items-center gap-2 mb-4">
        <View
          className="flex-1 flex-row items-center bg-surface-container-low rounded-xl py-3.5 px-3.5"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
        >
          <MaterialIcons name="search" size={20} color="#707a6c" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-[15px] text-on-surface p-0"
            placeholder="Search recipes, ingredients, cuisines…"
            placeholderTextColor="#707a6c"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            // Remove native focus ring on web
            style={{ outlineStyle: 'none' } as object}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={18} color="#707a6c" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.8}
          className={clsx(
            'flex-row items-center gap-1.5 px-4 py-3.5 rounded-xl',
            query.trim() ? 'bg-primary' : 'bg-surface-container',
          )}
        >
          <MaterialIcons name="search" size={18} color={query.trim() ? '#fff' : '#707a6c'} />
          <Text className={clsx('text-[13px] font-semibold', query.trim() ? 'text-white' : 'text-on-surface-variant')}>
            Find
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cuisine filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CUISINE_FILTERS.map((c) => {
          const active = activeCuisine === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => handleCuisineSelect(c.id)}
              activeOpacity={0.75}
              className={clsx(
                'flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border',
                active
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-low border-outline-variant',
              )}
            >
              <MaterialIcons name={c.icon} size={14} color={active ? '#fff' : '#4a5568'} />
              <Text className={clsx('text-[13px] font-semibold', active ? 'text-white' : 'text-on-surface-variant')}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
