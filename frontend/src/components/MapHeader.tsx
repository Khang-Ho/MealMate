import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MapHeaderProps {
  onBack?: () => void;
}

export const MAP_HEADER_HEIGHT = 64;
const EXTRA_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

export const MapHeader: React.FC<MapHeaderProps> = ({ onBack }) => (
  <View
    className="absolute left-0 right-0 h-16 flex-row items-center px-6 z-50"
    style={{
      top: EXTRA_TOP,
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(191,202,186,0.2)',
    }}
  >
    {onBack && (
      <TouchableOpacity
        className="w-9 h-9 rounded-full bg-surface-container-low items-center justify-center mr-2.5"
        onPress={onBack}
        activeOpacity={0.7}
      >
        <MaterialIcons name="arrow-back" size={20} color="#0d631b" />
      </TouchableOpacity>
    )}
    <Text className="text-lg font-extrabold text-primary">MealMate</Text>
  </View>
);
