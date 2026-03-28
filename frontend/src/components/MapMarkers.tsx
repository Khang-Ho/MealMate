import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: W, height: H } = Dimensions.get('window');

interface StorePin {
  id: string;
  top: number;
  left: number;
  label: string;
  labelBg: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  accentColor: string;
  isSelected?: boolean;
}

const PINS: StorePin[] = [
  { id: 'target', top: H * 0.38, left: W * 0.6, label: 'All Items', labelBg: '#0d631b', icon: 'shopping-cart', iconColor: '#ba1a1a', accentColor: '#0d631b', isSelected: true },
  { id: 'wholefoods', top: H * 0.62, left: W * 0.3, label: 'All Items', labelBg: '#0d631b', icon: 'eco', iconColor: '#0d631b', accentColor: '#0d631b' },
  { id: 'safeway', top: H * 0.28, left: W * 0.25, label: 'Missing 2', labelBg: '#ba1a1a', icon: 'storefront', iconColor: '#0058bc', accentColor: '#ba1a1a' },
];

const UserLocationDot: React.FC = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 2.2, duration: 900, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 400, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.pin, { top: H * 0.52, left: W * 0.45 }]}>
      <Animated.View style={[styles.userPing, { transform: [{ scale }], opacity }]} />
      <View style={styles.userDot} />
    </View>
  );
};

const StorePinMarker: React.FC<StorePin> = ({ top, left, label, labelBg, icon, iconColor, accentColor, isSelected }) => (
  <View style={[styles.pin, { top, left }, isSelected && styles.pinSelected]}>
    <View style={[styles.pinLabel, { backgroundColor: labelBg }]}
      // @ts-ignore
      shadow={{ color: '#000', offset: { width: 0, height: 2 }, opacity: 0.3, radius: 4 }}
    >
      <Text style={styles.pinLabelText}>{label}</Text>
    </View>
    <View style={[styles.pinIcon, { borderBottomColor: accentColor }, isSelected && styles.pinIconSelected]}>
      <MaterialIcons name={icon} size={isSelected ? 24 : 20} color={iconColor} />
    </View>
    <View style={[styles.pinArrow, { backgroundColor: accentColor }]} />
  </View>
);

export const MapMarkers: React.FC = () => (
  <View className="absolute inset-0 z-10" pointerEvents="box-none">
    <UserLocationDot />
    {PINS.map((pin) => (
      <StorePinMarker key={pin.id} {...pin} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  pin: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -24 }, { translateY: -68 }],
  },
  pinSelected: {
    transform: [{ translateX: -28 }, { translateY: -80 }, { scale: 1.1 }],
  },
  pinLabel: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLabelText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pinIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  pinIconSelected: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  pinArrow: {
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
    marginTop: -6,
    elevation: 4,
  },
  userDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0058bc',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  userPing: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0058bc',
    top: -8,
    left: -8,
  },
});
