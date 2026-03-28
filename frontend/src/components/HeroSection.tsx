import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const HeroSection: React.FC = () => (
  <View className="px-6 pt-8 pb-3">
    <Text className="text-[42px] font-extrabold text-on-surface leading-[48px] mb-3">
      {'What do you\nwant to eat?'}
    </Text>
    <Text className="text-base text-on-surface-variant mb-6 leading-6">
      AI-curated meals based on your history and pantry.
    </Text>
    <View className="flex-row items-center gap-2">
      <View
        className="flex-1 flex-row items-center bg-surface-container-low rounded-xl py-3.5 px-3.5"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
      >
        <MaterialIcons name="search" size={20} color="#707a6c" style={{ marginRight: 8 }} />
        <TextInput
          className="flex-1 text-[15px] text-on-surface p-0"
          placeholder="Search recipes, ingredients, or cuisines..."
          placeholderTextColor="#707a6c"
        />
      </View>
      <TouchableOpacity className="bg-secondary flex-row items-center gap-1.5 px-3.5 py-3.5 rounded-xl" activeOpacity={0.8}>
        <MaterialIcons name="auto-fix-high" size={14} color="#fff" />
        <Text className="text-white text-[13px] font-semibold">AI Filter</Text>
      </TouchableOpacity>
    </View>
  </View>
);
