import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AVATAR_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCmQt1qBXJH7FyfKCUMwkYnYDvA9ULz61MNyWza6iMqTWl4ULvVrQHhFVLLUIwWK4COAUKlbn8S5nVbOyX01AxE5iLpqCTC5TdsxSwz2-_QOCiJ_fc9Km69_toJop_9j8sKgFbnuaaDhkql3yjORIrrNUveQPmmlzdV8q2NzTVPiOX9egaasbQL-UD8OBf_ttdrvgmjgQ-keU8cM8SLFMI_Lx32HdDVMmWYnczzgfg28rShZrYSIrvSyGY-0xVqK8A5SWuyBRMmIII';

export const AppHeader: React.FC = () => (
  <View className="flex-row items-center justify-between px-6 h-16 bg-surface">
    <View className="flex-row items-center gap-3">
      <TouchableOpacity>
        <MaterialIcons name="menu" size={24} color="#0d631b" />
      </TouchableOpacity>
      <Text className="text-xl font-extrabold text-primary">MealMate</Text>
    </View>
    <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed">
      <Image source={{ uri: AVATAR_URI }} className="w-10 h-10" />
    </View>
  </View>
);
