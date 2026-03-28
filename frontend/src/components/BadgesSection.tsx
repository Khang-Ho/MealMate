import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBadges } from '../hooks/useBadges';
import { Badge, BADGES } from '../utils/badges';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Tier gradient palettes ───────────────────────────────────────────────────
const TIER_GRADIENTS: Record<string, [string, string, string]> = {
  starter:  ['#6FCF97', '#27AE60', '#1B5E20'],
  bronze:   ['#F5A623', '#CD7F32', '#7D4F24'],
  silver:   ['#D0D0D8', '#8A8A9A', '#4A4A5A'],
  gold:     ['#FFE066', '#D4A017', '#7B5C00'],
  diamond:  ['#80DEEA', '#4FC3F7', '#0077B6'],
};

const TIER_GLOW: Record<string, string> = {
  starter:  '#4ade8088',
  bronze:   '#CD7F3266',
  silver:   '#8A8A9A66',
  gold:     '#D4A01766',
  diamond:  '#4FC3F766',
};

// ─── Animated Glow Ring ───────────────────────────────────────────────────────
function GlowRing({ color, size }: { color: string; size: number }) {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size + 20,
        height: size + 20,
        borderRadius: (size + 20) / 2,
        backgroundColor: color,
        opacity: pulse,
        transform: [{ scale: pulse }],
      }}
    />
  );
}

// ─── Hero Badge (current highest) ────────────────────────────────────────────
function HeroBadge({ badge, count }: { badge: Badge; count: number }) {
  const grad = TIER_GRADIENTS[badge.tier];
  const glow = TIER_GLOW[badge.tier];

  return (
    <View style={styles.heroWrapper}>
      {/* Background gradient card */}
      <LinearGradient
        colors={[grad[0] + '22', grad[1] + '11', 'transparent']}
        style={styles.heroCard}
      >
        {/* Glow + emoji */}
        <View style={styles.heroEmojiContainer}>
          <GlowRing color={glow} size={70} />
          <View style={[styles.heroEmojiCircle, { shadowColor: grad[1] }]}>
            <LinearGradient colors={[grad[0], grad[2]]} style={styles.heroEmojiGrad}>
              <Text style={styles.heroEmoji}>{badge.emoji}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Text */}
        <View style={styles.heroTextBlock}>
          <View style={[styles.heroTierPill, { backgroundColor: grad[1] + '22' }]}>
            <Text style={[styles.heroTierText, { color: grad[1] }]}>
              {badge.tier.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroLabel}>{badge.label}</Text>
          <Text style={styles.heroDesc}>{badge.description}</Text>
          <Text style={[styles.heroCount, { color: grad[1] }]}>
            {count} meals cooked 🍳
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function ProgressBar({
  progress,
  fromColor,
  toColor,
}: {
  progress: number;
  fromColor: string;
  toColor: string;
}) {
  const animW = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.timing(animW, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, [progress, animW, shimmer]);

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFillOuter,
          {
            width: animW.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={[fromColor, toColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* shimmer overlay */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [
                {
                  translateX: shimmer.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-80, 80],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

// ─── Milestone Dot Row ────────────────────────────────────────────────────────
function MilestoneRow({
  milestones,
  cookedCount,
}: {
  milestones: Badge[];
  cookedCount: number;
}) {
  return (
    <View style={styles.milestoneRow}>
      {milestones.map((b, i) => {
        const unlocked = cookedCount >= b.threshold;
        const grad = TIER_GRADIENTS[b.tier];
        return (
          <React.Fragment key={b.tier}>
            {i > 0 && (
              <View
                style={[
                  styles.milestoneLine,
                  { backgroundColor: unlocked ? grad[1] : '#E5E7EB' },
                ]}
              />
            )}
            <View style={styles.milestoneDotWrap}>
              <LinearGradient
                colors={unlocked ? [grad[0], grad[2]] : ['#D1D5DB', '#9CA3AF']}
                style={styles.milestoneDot}
              >
                <Text style={styles.milestoneDotEmoji}>
                  {unlocked ? b.emoji : '🔒'}
                </Text>
              </LinearGradient>
              <Text style={[styles.milestoneLabel, { color: unlocked ? grad[1] : '#9CA3AF' }]}>
                {b.threshold}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Badge Scroll Card ────────────────────────────────────────────────────────
function BadgeScrollCard({
  badge,
  unlocked,
  isHighest,
}: {
  badge: Badge;
  unlocked: boolean;
  isHighest: boolean;
}) {
  const grad = TIER_GRADIENTS[badge.tier];
  const shimmerX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (!unlocked) return;
    Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  }, [unlocked, shimmerX]);

  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.scrollCard, isHighest && styles.scrollCardActive]}>
      {/* Active glow border */}
      {isHighest && (
        <LinearGradient
          colors={[grad[0], grad[1], grad[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scrollCardGlowBorder}
        />
      )}

      <View style={[styles.scrollCardInner, { backgroundColor: unlocked ? grad[0] + '15' : '#F9FAFB' }]}>
        {/* Emoji circle */}
        <LinearGradient
          colors={unlocked ? [grad[0], grad[2]] : ['#E5E7EB', '#D1D5DB']}
          style={styles.scrollCardIcon}
        >
          <Text style={styles.scrollCardEmoji}>{unlocked ? badge.emoji : '🔒'}</Text>
        </LinearGradient>

        {/* Shimmer on unlocked */}
        {unlocked && (
          <Animated.View
            style={[
              styles.cardShimmer,
              {
                transform: [
                  {
                    translateX: shimmerX.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-120, 120],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        <Text
          style={[styles.scrollCardLabel, { color: unlocked ? grad[1] : '#9CA3AF' }]}
          numberOfLines={1}
        >
          {badge.label}
        </Text>
        <Text style={styles.scrollCardDesc} numberOfLines={2}>
          {badge.description}
        </Text>
        <View style={[styles.scrollCardThreshold, { backgroundColor: unlocked ? grad[1] + '22' : '#F3F4F6' }]}>
          <Text style={[styles.scrollCardThresholdText, { color: unlocked ? grad[1] : '#9CA3AF' }]}>
            {badge.threshold} meals
          </Text>
        </View>

        {isHighest && (
          <LinearGradient
            colors={[grad[0], grad[2]]}
            style={styles.activePill}
          >
            <Text style={styles.activePillText}>✦ ACTIVE</Text>
          </LinearGradient>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main BadgesSection ───────────────────────────────────────────────────────
export const BadgesSection: React.FC = () => {
  const { cookedCount, highestBadge, unlockedBadges, nextBadge, progressToNext } = useBadges();

  const nextGrad = nextBadge ? TIER_GRADIENTS[nextBadge.tier] : null;
  const currGrad = highestBadge ? TIER_GRADIENTS[highestBadge.tier] : null;

  return (
    <View style={styles.section}>
      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.sectionSub}>Your culinary milestones</Text>
        </View>
        <View style={styles.countBadge}>
          <LinearGradient
            colors={['#4ade80', '#0d631b']}
            style={styles.countBadgeGrad}
          >
            <Text style={styles.countBadgeText}>{unlockedBadges.length}/{BADGES.length}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* ── Hero: current badge ── */}
      {highestBadge ? (
        <HeroBadge badge={highestBadge} count={cookedCount} />
      ) : (
        <View style={styles.noBadgeCard}>
          <Text style={styles.noBadgeEmoji}>🍳</Text>
          <Text style={styles.noBadgeText}>Cook your first meal to earn a badge!</Text>
        </View>
      )}

      {/* ── Progress to next ── */}
      {nextBadge && nextGrad && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              Unlocking <Text style={{ color: nextGrad[1], fontWeight: '800' }}>{nextBadge.emoji} {nextBadge.label}</Text>
            </Text>
            <Text style={[styles.progressFraction, { color: nextGrad[1] }]}>
              {cookedCount}/{nextBadge.threshold}
            </Text>
          </View>
          <ProgressBar
            progress={progressToNext}
            fromColor={currGrad ? currGrad[0] : '#4ade80'}
            toColor={nextGrad[1]}
          />
        </View>
      )}

      {/* ── Milestone timeline ── */}
      <MilestoneRow milestones={BADGES} cookedCount={cookedCount} />

      {/* ── Horizontal Badge Cards ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollCards}
      >
        {BADGES.map((b) => (
          <BadgeScrollCard
            key={b.tier}
            badge={b}
            unlocked={unlockedBadges.some((u) => u.tier === b.tier)}
            isHighest={highestBadge?.tier === b.tier}
          />
        ))}
      </ScrollView>

      {/* ── All unlocked ── */}
      {!nextBadge && (
        <LinearGradient
          colors={['#80DEEA22', '#4FC3F744']}
          style={styles.allDoneCard}
        >
          <Text style={styles.allDoneText}>💎 Diamond Legend — You've mastered MealMate!</Text>
        </LinearGradient>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = 140;

const styles = StyleSheet.create({
  section: { marginBottom: 40 },

  // Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#181d17', letterSpacing: -0.5 },
  sectionSub: { fontSize: 13, color: '#707a6c', marginTop: 2 },
  countBadge: { borderRadius: 999, overflow: 'hidden' },
  countBadgeGrad: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  countBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Hero
  heroWrapper: { marginHorizontal: 24, marginBottom: 16 },
  heroCard: {
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    backgroundColor: '#fff',
  },
  heroEmojiContainer: { alignItems: 'center', justifyContent: 'center', width: 90, height: 90 },
  heroEmojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  heroEmojiGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 34 },
  heroTextBlock: { flex: 1, gap: 4 },
  heroTierPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, marginBottom: 2 },
  heroTierText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroLabel: { fontSize: 20, fontWeight: '800', color: '#181d17', letterSpacing: -0.3 },
  heroDesc: { fontSize: 13, color: '#707a6c' },
  heroCount: { fontSize: 13, fontWeight: '700', marginTop: 4 },

  // No badge
  noBadgeCard: {
    marginHorizontal: 24,
    backgroundColor: '#f1f5eb',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  noBadgeEmoji: { fontSize: 40 },
  noBadgeText: { fontSize: 14, color: '#707a6c', textAlign: 'center', fontWeight: '500' },

  // Progress
  progressSection: { marginHorizontal: 24, marginBottom: 20, gap: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontSize: 14, color: '#40493d', fontWeight: '600', flex: 1 },
  progressFraction: { fontSize: 14, fontWeight: '800' },
  progressTrack: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFillOuter: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 50,
    backgroundColor: 'rgba(255,255,255,0.45)',
    transform: [{ skewX: '-20deg' }],
  },

  // Milestone
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  milestoneLine: { flex: 1, height: 3, borderRadius: 2 },
  milestoneDotWrap: { alignItems: 'center', gap: 5 },
  milestoneDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  milestoneDotEmoji: { fontSize: 18 },
  milestoneLabel: { fontSize: 10, fontWeight: '700' },

  // Scroll cards
  scrollCards: { paddingHorizontal: 24, gap: 12, paddingBottom: 4 },
  scrollCard: { width: CARD_W, borderRadius: 22, overflow: 'hidden' },
  scrollCardActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollCardGlowBorder: {
    position: 'absolute',
    inset: 0,
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 22,
    padding: 2,
  },
  scrollCardInner: {
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    margin: 2,
    overflow: 'hidden',
  },
  scrollCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollCardEmoji: { fontSize: 24 },
  cardShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ skewX: '-15deg' }],
  },
  scrollCardLabel: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  scrollCardDesc: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', lineHeight: 14 },
  scrollCardThreshold: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  scrollCardThresholdText: { fontSize: 10, fontWeight: '700' },
  activePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activePillText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  // All done
  allDoneCard: {
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  allDoneText: { color: '#0277BD', fontWeight: '700', fontSize: 13, textAlign: 'center' },
});
