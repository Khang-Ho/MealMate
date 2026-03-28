import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = Math.round((SCREEN_WIDTH - 48) * (9 / 16));

interface DishHeroProps {
  title?: string;
  label?: string;
  cookTime?: string;
  servings?: string;
  imageUrl?: string;
}

const DEFAULT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAoDRFbxlssEXX29FHZDR9C7QtcWphkGFGMZczxbeVZLAy3-BhMprYo7d_6KP6M3cRCYYJ_HVuTF29ULaWzhaWrxjo-OUcwkWFJTvEIIQ_g5UMyaboU2Mhsa1DFHqMVh58FcBRe6bJas-OwAQlEHKR7NKdG_eKdP4TnUsxoLea4UmWq-KIz46r7riMDCrMogwAOj1tgSkcsqQaLpgnakPCTpp14xl600Kz2rZwDNvUUQsnxVZBL30WO67H-q3pdP15-zVCFumuZ2xI';

export const DishHero: React.FC<DishHeroProps> = ({
  title = 'Mediterranean Shakshuka',
  label = 'Featured Recipe',
  cookTime = '25 mins',
  servings = 'Serves 2',
  imageUrl = DEFAULT_IMAGE,
}) => (
  <View
    className="mx-6 mt-6 mb-8 rounded-3xl overflow-hidden"
    style={{ height: HERO_HEIGHT, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 }}
  >
    <Image source={{ uri: imageUrl }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
    <View className="absolute bottom-0 left-0 right-0 p-5" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
      <Text className="text-[10px] font-bold text-primary-fixed uppercase tracking-[1.5px] mb-1.5">{label}</Text>
      <Text className="text-[22px] font-extrabold text-white mb-2.5">{title}</Text>
      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name="schedule" size={16} color="rgba(255,255,255,0.9)" />
          <Text className="text-[13px]" style={{ color: 'rgba(255,255,255,0.9)' }}>{cookTime}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name="restaurant" size={16} color="rgba(255,255,255,0.9)" />
          <Text className="text-[13px]" style={{ color: 'rgba(255,255,255,0.9)' }}>{servings}</Text>
        </View>
      </View>
    </View>
  </View>
);
