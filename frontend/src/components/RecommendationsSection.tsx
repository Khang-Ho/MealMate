import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';
import { RecipeCard } from './RecipeCard';
import { Recipe } from '../types/recipe';

const FEATURED: Recipe = {
  id: '1',
  title: 'Herbed Atlantic Salmon',
  description: 'Uses 4 ingredients from your pantry. High in Omega-3 and aligns with your recent health goals.',
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdpdIDfucGeCJsU01KY90yqzgqxzq14wWBm6Jl0fZ0d4VnxfPcMKzFQ5T_FW60tFmTPY37Cn_4pVMN5k0I75i-LLWXmQf0JUy8ynUienLzKfjWdnt3c44k3UEwhFkm3JzdMxlB_4iP4Kx7MGKU3cuOs5u9zHR8beimI-2efiEjUnoNPEBs0LFWYI3MoJIkmPs6Ne88tIhKEm7oQwfpzYpyFEQIxqBcSNBLOTgrnc2eYlotvWk2KYHUYw3qTJCCBs7Oyg7OyE8ib4I',
};

const SECONDARY: Recipe[] = [
  {
    id: '2', title: 'Quinoa Power Bowl',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdmwMmbvYEqcOsvrfkB8_Sz0zN2TMD5u6tZHTli_abSmJhtlINMePYtHADfS2vI2LSLapFgsSugm7N88NsTL41o5u1bJJMN9AN-dAlUImUP1xJqIhSo5f3J8RoN0biFjDzV1b-ZeLhr_sUKOTx9oJdTa6pGoqLVDEFZvIDbu661-8HsECXgHzJDLdo1V4bdnsaylIHzy72phQ8U4QVWF3upuZewXsUtasPfJwyJmSmm3piQ5a0qPAmVTXc0mueSw4ecKB82DfOcWY',
    tags: [
      { label: '15 MIN', bgColor: Colors.primaryFixed, textColor: Colors.onPrimaryFixed },
      { label: 'VEGGIE', bgColor: Colors.secondaryFixed, textColor: Colors.onSecondaryFixed },
    ],
  },
  {
    id: '3', title: 'Avocado Tartine',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbp3bWNvISEdOUs42uXu2lQa6VZ9jegk9seXdHKxJrCpjdWDWnfvN62GezJOkkcsSyo47VqAIZGOK743pzCtbZCMln2aKV6V5-QfeDOgXOg6d-bqKHFIRfp8iuBGSRnuEaRw1GpQDlqpI0Oc6_vlgObI2dVNPa1t9Mz1Iws0vSk8yfT5V6wa6nGLk24Hiai8sQYEfP6Y91HoT2bASFC_bgScXSU9a0WKVCzfAeEPb_3brPcCD0UlKDViV2AmCafxuZTIttnObGoJQ',
    tags: [
      { label: '5 MIN', bgColor: Colors.primaryFixed, textColor: Colors.onPrimaryFixed },
      { label: 'PANTRY READY', bgColor: Colors.secondaryFixed, textColor: Colors.onSecondaryFixed },
    ],
  },
];

interface RecommendationsSectionProps {
  onRecipePress?: (recipeId: string, recipeTitle: string) => void;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ onRecipePress }) => (
  <View className="px-6 pt-4 mb-8">
    <View className="flex-row items-end justify-between mb-5">
      <View>
        <Text className="text-[22px] font-bold text-on-surface">AI Recommendations</Text>
        <Text className="text-[13px] text-outline mt-0.5">Personalized for your palate</Text>
      </View>
      <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
        <Text className="text-[13px] font-bold text-primary">Refresh</Text>
        <MaterialIcons name="refresh" size={14} color="#0d631b" />
      </TouchableOpacity>
    </View>

    {/* Featured card */}
    <TouchableOpacity
      className="h-[320px] rounded-2xl overflow-hidden mb-4"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6 }}
      activeOpacity={0.95}
      onPress={() => onRecipePress?.(FEATURED.id, FEATURED.title)}
    >
      <Image source={{ uri: FEATURED.imageUrl }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
      <View className="flex-1 justify-end">
        <View className="p-6" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
          <View className="self-start bg-secondary-container px-2.5 py-1 rounded-full mb-2.5">
            <Text className="text-white text-[10px] font-bold tracking-[0.5px] uppercase">PERFECT MATCH</Text>
          </View>
          <Text className="text-[26px] font-bold text-white mb-2">{FEATURED.title}</Text>
          <Text className="text-[13px] leading-5 mb-4" style={{ color: 'rgba(255,255,255,0.82)' }}>{FEATURED.description}</Text>
          <View className="self-start bg-primary px-6 py-3 rounded-full">
            <Text className="text-white font-bold text-sm">Cook Now →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>

    {/* Secondary cards */}
    <View className="flex-row gap-3">
      {SECONDARY.map((recipe) => (
        <RecipeCard key={recipe.id} {...recipe} onPress={() => onRecipePress?.(recipe.id, recipe.title)} />
      ))}
    </View>
  </View>
);
