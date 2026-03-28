import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';

const PRIMARY_FIXED = '#a3f69c';

export type MarkerStatus = 'available' | 'missing';

interface MapStoreMarkerProps {
  name: string;
  distance: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  status: MarkerStatus;
  onPress?: () => void;
  style?: object;
}

export const MapStoreMarker: React.FC<MapStoreMarkerProps> = ({
  name,
  distance,
  icon,
  status,
  onPress,
  style,
}) => {
  const isAvailable = status === 'available';
  const badgeColor = isAvailable ? Colors.primary : '#ba1a1a';
  const badgeText = isAvailable ? 'Food Available' : 'Missing Items';
  const iconBg = isAvailable ? PRIMARY_FIXED : '#ffdad6';
  const iconColor = isAvailable ? Colors.primary : '#ba1a1a';
  const borderColor = isAvailable ? PRIMARY_FIXED : '#ffdad6';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.wrapper, style]}
    >
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
      <View style={[styles.card, { borderColor }]}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.distance}>{distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    shadowColor: '#181d17',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingRight: 8,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  distance: {
    fontSize: 9,
    color: Colors.outline,
    fontWeight: '500',
    marginTop: 1,
  },
});
