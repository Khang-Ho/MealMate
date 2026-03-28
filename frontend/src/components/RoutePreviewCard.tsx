import React, { useRef, useEffect } from 'react';
import { View, Text, Image, Animated } from 'react-native';

const MAP_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC4Z-WefLPfIGUZasXEEqsSHYbqLqwBbcg2x1ajvqX0FlS6Sjb1kth6oskRmzE2e3puK2xZWD9lYCfNxtLBjZCHcoGbtehCOSha-usnt_ih3DjS0ObKwdeHH2dZI-x235yK0suVDRyJFl89fUZiCd8X5t3HGypk45vhLwHdixzaPEHa06BTfon-PCIOG9BqbRwyugfFJ9BCAEtuFoUin7CFxIaPrEzys625Y2joBs8COckUodlhtWJTWm4zjE1D9GR8hI6xcTS-PP4';

interface RoutePreviewCardProps {
  label?: string;
}

export const RoutePreviewCard: React.FC<RoutePreviewCardProps> = ({
  label = '6 min detour identified',
}) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.8, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.6, duration: 500, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View className="rounded-3xl overflow-hidden" style={{ aspectRatio: 16 / 9 }}>
      <Image source={{ uri: MAP_IMAGE_URI }} className="w-full h-full opacity-[0.55]" resizeMode="cover" />

      {/* Dim overlay */}
      <View className="absolute inset-0" style={{ backgroundColor: 'rgba(241,245,235,0.25)' }} />

      {/* Centered label */}
      <View className="absolute inset-0 items-center justify-center">
        <View
          className="flex-row items-center gap-2.5 rounded-full px-5 py-3 border border-white/90"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 }}
        >
          {/* Animated pulse dot */}
          <View className="w-3 h-3 items-center justify-center">
            <Animated.View
              className="absolute w-3 h-3 rounded-full bg-secondary"
              style={{ transform: [{ scale: pulse }], opacity: pulseOpacity }}
            />
            <View className="w-2.5 h-2.5 rounded-full bg-secondary" />
          </View>
          <Text className="text-sm font-bold text-on-surface">{label}</Text>
        </View>
      </View>
    </View>
  );
};
