import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FABProps {
  onPress?: () => void;
}

export const FAB: React.FC<FABProps> = ({ onPress }) => (
  <TouchableOpacity
    className="absolute right-6 bottom-28 w-14 h-14 rounded-full bg-primary items-center justify-center"
    style={{ shadowColor: '#0d631b', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 }}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <MaterialIcons name="bolt" size={28} color="#fff" />
  </TouchableOpacity>
);
