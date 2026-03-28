import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ChecklistActionsProps {
  onFindNearby?: () => void;
  onSync?: () => void;
}

export const ChecklistActions: React.FC<ChecklistActionsProps> = ({ onFindNearby, onSync }) => (
  <View className="px-6 mt-2 gap-2.5">
    <TouchableOpacity
      className="flex-row items-center justify-center gap-2.5 bg-primary py-[18px] rounded-full"
      style={{ shadowColor: '#0d631b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      activeOpacity={0.85}
      onPress={onFindNearby}
    >
      <MaterialIcons name="explore" size={22} color="#fff" />
      <Text className="text-white font-bold text-[17px]">Find Ingredients Nearby</Text>
    </TouchableOpacity>

    <TouchableOpacity
      className="flex-row items-center justify-center gap-2 py-3.5 rounded-full"
      activeOpacity={0.7}
      onPress={onSync}
    >
      <MaterialIcons name="sync" size={20} color="#0058bc" />
      <Text className="text-secondary font-bold text-sm">Sync with Smart Refrigerator</Text>
    </TouchableOpacity>
  </View>
);
