import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  streak: number;
  onClose: () => void;
}

export function StreakCelebrationModal({ visible, streak, onClose }: Props) {
  const bgOpacity = useSharedValue(0);
  const flameScale = useSharedValue(0.1);
  const flameRotate = useSharedValue(0);
  const textTranslateY = useSharedValue(100);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // 1. Fade in the backdrop
      bgOpacity.value = withTiming(1, { duration: 400 });
      
      // 2. Giant flame pops out like Duolingo
      flameScale.value = withSpring(1, { damping: 10, stiffness: 120 });
      
      // 3. Flame subtle wiggle continuously
      flameRotate.value = withDelay(
        500,
        withRepeat(
          withSequence(
            withTiming(-6, { duration: 150, easing: Easing.inOut(Easing.quad) }),
            withTiming(6, { duration: 300, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 150, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          true
        )
      );

      // 4. Text drops down and bounces
      textTranslateY.value = withDelay(
        200,
        withSpring(0, { damping: 12, stiffness: 90 })
      );
      textOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));

    } else {
      // Reset immediately when closing
      bgOpacity.value = 0;
      flameScale.value = 0.1;
      flameRotate.value = 0;
      textTranslateY.value = 100;
      textOpacity.value = 0;
    }
  }, [visible]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotateZ: `${flameRotate.value}deg` }
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[styles.overlay, bgStyle]}>
        
        {/* Core Animated Objects */}
        <View style={styles.centerContainer}>
          <Animated.View style={flameStyle}>
            <Text style={styles.flameEmoji}>🔥</Text>
          </Animated.View>

          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>DAY STREAK!</Text>
            <Text style={styles.subtitle}>You're on fire! Keep it up tomorrow.</Text>
          </Animated.View>
        </View>

        {/* Dismiss Button */}
        <Animated.View style={textStyle}>
          <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>

      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.92)', // Very dark slate, almost obsidian
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  flameEmoji: {
    fontSize: 160,
    textShadowColor: 'rgba(251, 146, 60, 0.8)', // Glowing orange fire
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 60,
    marginBottom: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 84,
    fontWeight: '900',
    color: '#fb923c',
    letterSpacing: -2,
    textShadowColor: 'rgba(251, 146, 60, 0.6)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 24,
    lineHeight: 90,
  },
  streakLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    marginTop: -10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
    marginTop: 14,
  },
  button: {
    position: 'absolute',
    bottom: -((Dimensions.get('window').height / 2) - 80), // offset from center
    width: width - 48,
    backgroundColor: '#fb923c', // Orange accent to match fire
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});
