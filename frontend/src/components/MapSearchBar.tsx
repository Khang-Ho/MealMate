import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';

interface MapSearchBarProps {
  placeholder?: string;
  onFilterPress?: () => void;
}

export const MapSearchBar: React.FC<MapSearchBarProps> = ({
  placeholder = 'Search markets',
  onFilterPress,
}) => {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialIcons name="search" size={22} color={Colors.outline} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline + '99'}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity onPress={onFilterPress} activeOpacity={0.7}>
          <MaterialIcons name="tune" size={22} color={Colors.outline} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 56,
    width: '100%',
    shadowColor: '#181d17',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.onSurface,
  },
});
