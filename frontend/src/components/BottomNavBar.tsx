import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';

export interface NavTab {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const DEFAULT_TABS: NavTab[] = [
  { id: 'cook', label: 'Cook', icon: 'restaurant' },
  { id: 'inventory', label: 'Inventory', icon: 'kitchen' },
  { id: 'stores', label: 'Stores', icon: 'store' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

interface BottomNavBarProps {
  tabs?: NavTab[];
  initialActive?: string;
  onTabPress?: (tabId: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  tabs = DEFAULT_TABS,
  initialActive,
  onTabPress,
}) => {
  const [active, setActive] = useState(initialActive ?? tabs[0]?.id ?? '');

  const handlePress = (id: string) => {
    setActive(id);
    onTabPress?.(id);
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row justify-around items-center pt-3 pb-7 px-4 rounded-tl-3xl rounded-tr-3xl"
      style={{ backgroundColor: 'rgba(255,255,255,0.93)', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 12 }}
    >
      {tabs.map((item) => {
        const isActive = active === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            className={clsx('items-center justify-center px-[18px] py-1.5 rounded-full', isActive && 'bg-primary-fixed')}
            onPress={() => handlePress(item.id)}
            activeOpacity={0.8}
          >
            <MaterialIcons name={item.icon} size={22} color={isActive ? '#0d631b' : '#94a3b8'} />
            <Text className={clsx('text-[11px] mt-0.5', isActive ? 'font-semibold text-primary' : 'font-medium text-[#94a3b8]')}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
