import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
  Dimensions,
  Animated,
  LayoutChangeEvent,
  ListRenderItemInfo,
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { BottomNavBar } from '../components/BottomNavBar';
import { RootStackParamList } from '../navigation/types';
import { useNearbyStores } from '../hooks/useNearbyStores';
import { useRecipeSuggestions, SuggestedRecipe } from '../hooks/useRecipeSuggestions';
import { Store } from '../types/store';

type MapNavProp = NativeStackNavigationProp<RootStackParamList, 'MarketMap'>;
type MapRouteProp = RouteProp<RootStackParamList, 'MarketMap'>;

const { width: SW, height: SH } = Dimensions.get('window');
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  green: '#059669',
  greenLight: '#ECFDF5',
  orange: '#F97316',
  orangeLight: '#fff7ed',
  red: '#dc2626',
  redLight: '#fef2f2',
  amber: '#d97706',
  amberLight: '#fffbeb',
  blue: '#2563eb',
  blueLight: '#eff6ff',
  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f8fafc',
  white: '#ffffff',
};

const NORMAL_MAP_H = Math.round(SH * 0.38);
const NAV_H = 80; // BottomNavBar approx height
const PIN_SIZE = 40; // overlay pin touchable size
const MAP_ZOOM = 13.5;
const ZOOM_MIN = 11;
const ZOOM_MAX = 18;

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusMeta(store: Store) {
  if (store.isOpen === false) return { label: 'Closed', color: C.red, bg: C.redLight };
  if (store.hasMissingItems) return { label: 'Partial', color: C.amber, bg: C.amberLight };
  return { label: 'Open', color: C.green, bg: C.greenLight };
}

/** Mercator projection: lat/lng → fraction [0,1] of the full world tile */
function mercatorFrac(lat: number, lng: number) {
  const x = (lng + 180) / 360;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
  return { x, y };
}

/** Mercator fraction → lat/lng */
function mercatorToLatLng(x: number, y: number) {
  const lng = x * 360 - 180;
  const lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) - Math.PI / 2);
  return { lat, lng };
}

/**
 * Convert a store's lat/lng to pixel position on the displayed static map image.
 * The static image shows `zoom` level centered at (centerLat, centerLng) with
 * displayed dimensions containerW × containerH (accounting for @2x being display-identical).
 */
function latLngToPixel(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  containerW: number,
  containerH: number,
) {
  const worldPx = Math.pow(2, zoom) * 256;
  const center = mercatorFrac(centerLat, centerLng);
  const point = mercatorFrac(lat, lng);
  return {
    x: containerW / 2 + (point.x - center.x) * worldPx,
    y: containerH / 2 + (point.y - center.y) * worldPx,
  };
}

/**
 * Deterministic estimate of how many missing ingredients a store "has".
 * Uses a simple hash of store name + ingredient name so it's consistent
 * across renders. Labeled clearly as estimated in the UI.
 */
function getStoreInventory(store: Store, missingIngredients: string[]) {
  const available: string[] = [];
  const missing: string[] = [];
  if (missingIngredients.length === 0) return { available, missing };

  for (const ing of missingIngredients) {
    let hash = 0;
    for (let i = 0; i < store.name.length + ing.length; i++) {
      const ch = i < store.name.length ? store.name.charCodeAt(i) : ing.charCodeAt(i - store.name.length);
      hash = (hash * 31 + ch) & 0xffff;
    }
    // ~75% chance each item is available (hash % 4 !== 0)
    if (hash % 4 !== 0) {
      available.push(ing);
    } else {
      missing.push(ing);
    }
  }
  return { available, missing };
}

/** Mapbox static URL — no custom pins when in full-map mode (we use overlays) */
function buildMapUrl(
  centerLat: number,
  centerLng: number,
  selected: Store | null,
  stores: Store[],
  mapW: number,
  mapH: number,
  withPins: boolean,
  zoom: number = MAP_ZOOM,
  userLat?: number,
  userLng?: number,
) {
  if (!MAPBOX_TOKEN) return null;
  let overlay = '';
  if (withPins) {
    const otherPins = stores
      .filter((s) => s.lat != null && s.lng != null && s.id !== selected?.id)
      .slice(0, 8)
      .map((s) => `pin-s+6b7280(${s.lng},${s.lat})`)
      .join(',');
    const selPin =
      selected?.lat != null && selected?.lng != null
        ? `pin-l+F97316(${selected.lng},${selected.lat})`
        : '';
    const uLat = userLat ?? centerLat;
    const uLng = userLng ?? centerLng;
    const userPin = `pin-s+3b82f6(${uLng},${uLat})`;
    overlay = [userPin, otherPins, selPin].filter(Boolean).join(',');
  } else {
    overlay = userLat != null ? `pin-s+3b82f6(${userLng},${userLat})` : '';
  }
  const overlayPart = overlay ? `${overlay}/` : '';
  return (
    `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
    `${overlayPart}${centerLng},${centerLat},${zoom},0/${Math.round(mapW)}x${Math.round(mapH)}@2x` +
    `?access_token=${MAPBOX_TOKEN}`
  );
}

// ── Store list row (normal mode) ──────────────────────────────────────────────

const StoreRow = memo(function StoreRow({
  store,
  index,
  selected,
  onPress,
  missingIngredients,
}: {
  store: Store;
  index: number;
  selected: boolean;
  onPress: () => void;
  missingIngredients: string[];
}) {
  const { label, color, bg } = statusMeta(store);
  const total = missingIngredients.length;
  const { available } = getStoreInventory(store, missingIngredients);
  const hasCount = total > 0 ? available.length : 0;
  const hasAll = total > 0 && hasCount === total;
  const hasNone = total > 0 && hasCount === 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 16,
        backgroundColor: selected ? C.greenLight : C.white,
        borderWidth: 1.5,
        borderColor: selected ? C.green : C.slate200,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: selected ? C.green : C.slate100,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '800', color: selected ? C.white : C.slate500 }}>
          {index + 1}
        </Text>
      </View>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '700', color: C.slate900, marginBottom: 3 }}
          numberOfLines={1}
        >
          {store.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 11, color: C.slate500 }}>{store.distance}</Text>
          {store.rating != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <MaterialIcons name="star" size={11} color="#f59e0b" />
              <Text style={{ fontSize: 11, color: C.slate500 }}>{store.rating.toFixed(1)}</Text>
            </View>
          )}
          {!!store.driveTime && (
            <Text style={{ fontSize: 11, color: C.slate500 }}>~{store.driveTime}</Text>
          )}
        </View>
        {total > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <MaterialIcons
              name={hasAll ? 'check-circle' : hasNone ? 'cancel' : 'remove-shopping-cart'}
              size={11}
              color={hasAll ? C.green : hasNone ? C.red : C.amber}
            />
            <Text style={{ fontSize: 10, fontWeight: '700', color: hasAll ? C.green : hasNone ? C.red : C.amber }}>
              {hasCount}/{total} items available
            </Text>
            <Text style={{ fontSize: 9, color: C.slate500, fontStyle: 'italic' }}>(est.)</Text>
          </View>
        )}
      </View>
      <View
        style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, backgroundColor: bg }}
      >
        <Text style={{ fontSize: 10, fontWeight: '700', color }}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ── Inline summary card (normal mode, appears above list) ─────────────────────

function InlineSummaryCard({
  store,
  onClose,
  missingIngredients,
  onFindAlternatives,
}: {
  store: Store;
  onClose: () => void;
  missingIngredients: string[];
  onFindAlternatives: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
  }, [store.id]);

  const { label, color, bg } = statusMeta(store);
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        marginHorizontal: 12,
        marginBottom: 10,
        backgroundColor: C.white,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1.5,
        borderColor: C.slate200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <TouchableOpacity
        onPress={onClose}
        hitSlop={12}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: C.slate100,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="close" size={14} color={C.slate500} />
      </TouchableOpacity>

      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingRight: 32 }}
      >
        <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
          <Text
            style={{ fontSize: 10, fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: 0.4 }}
          >
            {label} · {store.distance}
          </Text>
        </View>
        {store.isTopPick && (
          <View
            style={{ backgroundColor: C.orange, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}
          >
            <Text
              style={{ fontSize: 10, fontWeight: '700', color: C.white, textTransform: 'uppercase', letterSpacing: 0.4 }}
            >
              Top Pick
            </Text>
          </View>
        )}
      </View>

      <Text style={{ fontSize: 18, fontWeight: '800', color: C.slate900, marginBottom: 4 }} numberOfLines={1}>
        {store.name}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <MaterialIcons name="location-on" size={12} color={C.slate300} />
        <Text style={{ fontSize: 12, color: C.slate500, flex: 1 }} numberOfLines={1}>
          {store.address}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {store.rating != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MaterialIcons name="star" size={13} color="#f59e0b" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.slate700 }}>
              {store.rating.toFixed(1)}
            </Text>
            {store.totalRatings != null && (
              <Text style={{ fontSize: 11, color: C.slate500 }}>
                ({store.totalRatings > 999
                  ? `${(store.totalRatings / 1000).toFixed(1)}k`
                  : store.totalRatings})
              </Text>
            )}
          </View>
        )}
        {store.isOpen !== null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons name="schedule" size={12} color={color} />
            <Text style={{ fontSize: 12, fontWeight: '600', color }}>
              {store.isOpen ? 'Currently open' : 'Closed now'}
            </Text>
            {!!store.driveTime && (
              <Text style={{ fontSize: 12, color: C.slate500 }}>· ~{store.driveTime}</Text>
            )}
          </View>
        )}
      </View>

      {/* Missing items availability row */}
      {missingIngredients.length > 0 && (() => {
        const { available, missing } = getStoreInventory(store, missingIngredients);
        const total = missingIngredients.length;
        const hasCount = available.length;
        const hasAll = hasCount === total;
        const hasNone = hasCount === 0;
        const itemColor = hasAll ? C.green : hasNone ? C.red : C.amber;
        return (
          <View style={{ marginBottom: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
                padding: 10,
                borderRadius: 12,
                backgroundColor: hasAll ? C.greenLight : hasNone ? C.redLight : C.amberLight,
              }}
            >
              <MaterialIcons
                name={hasAll ? 'check-circle' : hasNone ? 'cancel' : 'shopping-cart'}
                size={16}
                color={itemColor}
              />
              <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: itemColor }}>
                {hasCount}/{total} of your items available here
              </Text>
              <Text style={{ fontSize: 10, color: C.slate500, fontStyle: 'italic' }}>est.</Text>
            </View>

            {/* List the identified items */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {available.map(ing => (
                <View key={ing} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.slate100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <MaterialIcons name="check" size={10} color={C.green} style={{ marginRight: 2 }} />
                  <Text style={{ fontSize: 11, color: C.slate700, fontWeight: '500' }}>{ing}</Text>
                </View>
              ))}
              {missing.map(ing => (
                <View key={ing} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.redLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <MaterialIcons name="close" size={10} color={C.red} style={{ marginRight: 2 }} />
                  <Text style={{ fontSize: 11, color: C.red, fontWeight: '500', textDecorationLine: 'line-through' }}>{ing}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })()}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, backgroundColor: C.greenLight, borderRadius: 12, padding: 10 }}>
          <Text style={{ fontSize: 9, fontWeight: '700', color: C.slate500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>IN STOCK</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.green }}>
            {store.availableItems}/{store.totalItems}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.blueLight, borderRadius: 12, padding: 10 }}>
          <Text style={{ fontSize: 9, fontWeight: '700', color: C.slate500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>EST. COST</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.blue }}>
            ${store.estimatedCost.toFixed(2)}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.orangeLight, borderRadius: 12, padding: 10 }}>
          <Text style={{ fontSize: 9, fontWeight: '700', color: C.slate500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>DRIVE</Text>
          <Text style={{ fontSize: 15, fontWeight: '900', color: C.orange, marginTop: 1 }}>
            {store.driveTime ? `~${store.driveTime}` : '—'}
          </Text>
        </View>
      </View>

      {/* Find alternatives if this store has 0 items */}
      {missingIngredients.length > 0 && getStoreInventory(store, missingIngredients).available.length === 0 && (
        <TouchableOpacity
          onPress={onFindAlternatives}
          activeOpacity={0.85}
          style={{
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: 12,
            borderRadius: 14,
            backgroundColor: C.amberLight,
            borderWidth: 1,
            borderColor: '#fde68a',
          }}
        >
          <MaterialIcons name="auto-awesome" size={16} color={C.amber} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.amber }}>
            Find alternative recipes
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ── Full-map mode: small floating description card ────────────────────────────

function MapPopupCard({ store, onClose, missingIngredients, onFindAlternatives }: { store: Store; onClose: () => void; missingIngredients: string[]; onFindAlternatives: () => void }) {
  const slideAnim = useRef(new Animated.Value(-20)).current;
  useEffect(() => {
    slideAnim.setValue(-20);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    }).start();
  }, [store.id]);

  const { label, color, bg } = statusMeta(store);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        backgroundColor: C.white,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1.5,
        borderColor: C.slate200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* Close */}
      <TouchableOpacity
        onPress={onClose}
        hitSlop={12}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: C.slate100,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="close" size={13} color={C.slate500} />
      </TouchableOpacity>

      {/* Tags */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6, paddingRight: 28 }}>
        <View style={{ backgroundColor: bg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 }}>
          <Text style={{ fontSize: 9, fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {label} · {store.distance}
          </Text>
        </View>
        {store.isTopPick && (
          <View style={{ backgroundColor: C.orange, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 }}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: C.white, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Top Pick
            </Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={{ fontSize: 15, fontWeight: '800', color: C.slate900, marginBottom: 3 }} numberOfLines={1}>
        {store.name}
      </Text>

      {/* Address */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 }}>
        <MaterialIcons name="location-on" size={11} color={C.slate300} />
        <Text style={{ fontSize: 11, color: C.slate500, flex: 1 }} numberOfLines={1}>
          {store.address}
        </Text>
      </View>

      {/* Rating + hours */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {store.rating != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MaterialIcons name="star" size={12} color="#f59e0b" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.slate700 }}>
              {store.rating.toFixed(1)}
            </Text>
            {store.totalRatings != null && (
              <Text style={{ fontSize: 10, color: C.slate500 }}>
                ({store.totalRatings > 999
                  ? `${(store.totalRatings / 1000).toFixed(1)}k`
                  : store.totalRatings})
              </Text>
            )}
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <MaterialIcons name="schedule" size={11} color={color} />
          <Text style={{ fontSize: 11, fontWeight: '600', color }}>
            {store.isOpen ? 'Open' : 'Closed'}
          </Text>
          {!!store.driveTime && (
            <Text style={{ fontSize: 11, color: C.slate500 }}>· ~{store.driveTime}</Text>
          )}
        </View>
      </View>

      {/* Missing items availability row */}
      {missingIngredients.length > 0 && (() => {
        const { available, missing } = getStoreInventory(store, missingIngredients);
        const total = missingIngredients.length;
        const hasCount = available.length;
        const hasAll = hasCount === total;
        const hasNone = hasCount === 0;
        const itemColor = hasAll ? C.green : hasNone ? C.red : C.amber;
        return (
          <View style={{ marginTop: 2 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
                padding: 10,
                borderRadius: 12,
                backgroundColor: hasAll ? C.greenLight : hasNone ? C.redLight : C.amberLight,
              }}
            >
              <MaterialIcons
                name={hasAll ? 'check-circle' : hasNone ? 'cancel' : 'shopping-cart'}
                size={16}
                color={itemColor}
              />
              <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: itemColor }}>
                {hasCount}/{total} of your items available here
              </Text>
              <Text style={{ fontSize: 10, color: C.slate500, fontStyle: 'italic' }}>est.</Text>
            </View>

            {/* List the identified items */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {available.map(ing => (
                <View key={ing} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.slate100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <MaterialIcons name="check" size={10} color={C.green} style={{ marginRight: 2 }} />
                  <Text style={{ fontSize: 11, color: C.slate700, fontWeight: '500' }}>{ing}</Text>
                </View>
              ))}
              {missing.map(ing => (
                <View key={ing} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.redLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <MaterialIcons name="close" size={10} color={C.red} style={{ marginRight: 2 }} />
                  <Text style={{ fontSize: 11, color: C.red, fontWeight: '500', textDecorationLine: 'line-through' }}>{ing}</Text>
                </View>
              ))}
            </View>

            {/* Find alternatives if this store has 0 items */}
            {getStoreInventory(store, missingIngredients).available.length === 0 && (
              <TouchableOpacity
                onPress={onFindAlternatives}
                activeOpacity={0.85}
                style={{
                  marginTop: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: C.amberLight,
                  borderWidth: 1,
                  borderColor: '#fde68a',
                }}
              >
                <MaterialIcons name="auto-awesome" size={16} color={C.amber} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.amber }}>
                  Find alternative recipes
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })()}
    </Animated.View>
  );
}

// ── Full-map mode: horizontal store chip ──────────────────────────────────────

const StoreChip = memo(function StoreChip({
  store,
  index,
  selected,
  onPress,
}: {
  store: Store;
  index: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { color, bg } = statusMeta(store);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        width: 130,
        marginLeft: index === 0 ? 12 : 8,
        padding: 10,
        borderRadius: 14,
        backgroundColor: selected ? C.greenLight : C.white,
        borderWidth: 1.5,
        borderColor: selected ? C.green : C.slate200,
      }}
    >
      {/* Index + status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: selected ? C.green : C.slate100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '800', color: selected ? C.white : C.slate500 }}>
            {index + 1}
          </Text>
        </View>
        <View style={{ backgroundColor: bg, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 10 }}>
          <Text style={{ fontSize: 8, fontWeight: '700', color }}>{statusMeta(store).label}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.slate900, marginBottom: 2 }} numberOfLines={2}>
        {store.name}
      </Text>
      <Text style={{ fontSize: 10, color: C.slate500 }}>{store.distance}</Text>
    </TouchableOpacity>
  );
});

// ── Alternatives modal ────────────────────────────────────────────────────────

function AlternativesModal({
  visible,
  onClose,
  suggestions,
  loading,
  error,
  missingIngredients,
  onSelectRecipe,
}: {
  visible: boolean;
  onClose: () => void;
  suggestions: SuggestedRecipe[];
  loading: boolean;
  error: string | null;
  missingIngredients: string[];
  onSelectRecipe: (id: number, title: string, image: string | null) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: C.white,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '85%',
            paddingBottom: 32,
          }}
        >
          {/* Handle bar */}
          <View style={{ alignItems: 'center', paddingTop: 12, marginBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.slate200 }} />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: C.slate200,
            }}
          >
            <MaterialIcons name="auto-awesome" size={22} color={C.amber} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.slate900 }}>
                Alternative Recipes
              </Text>
              <Text style={{ fontSize: 11, color: C.slate500, marginTop: 1 }}>
                Using ingredients you already have
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <MaterialIcons name="close" size={22} color={C.slate500} />
            </TouchableOpacity>
          </View>

          {/* Missing items context */}
          {missingIngredients.length > 0 && (
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 12,
                padding: 10,
                backgroundColor: C.amberLight,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#fde68a',
              }}
            >
              <Text style={{ fontSize: 11, color: '#92400e' }}>
                <Text style={{ fontWeight: '700' }}>Items not found nearby: </Text>
                {missingIngredients.slice(0, 4).join(', ')}
                {missingIngredients.length > 4 ? ` +${missingIngredients.length - 4} more` : ''}
              </Text>
            </View>
          )}

          {/* Content */}
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
              <ActivityIndicator size="large" color={C.amber} />
              <Text style={{ fontSize: 13, color: C.slate500 }}>Finding recipes for you…</Text>
            </View>
          ) : error ? (
            <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8, paddingHorizontal: 24 }}>
              <MaterialIcons name="wifi-off" size={36} color={C.slate300} />
              <Text style={{ fontSize: 14, color: C.slate700, textAlign: 'center' }}>
                Could not load suggestions
              </Text>
              <Text style={{ fontSize: 12, color: C.slate500, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : suggestions.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8 }}>
              <MaterialIcons name="search-off" size={36} color={C.slate300} />
              <Text style={{ fontSize: 14, color: C.slate700 }}>No suggestions found</Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {suggestions.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  onPress={() => onSelectRecipe(recipe.id, recipe.title, recipe.image)}
                  activeOpacity={0.82}
                  style={{
                    flexDirection: 'row',
                    backgroundColor: C.slate100,
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginBottom: 10,
                  }}
                >
                  {recipe.image ? (
                    <Image
                      source={{ uri: recipe.image }}
                      style={{ width: 80, height: 80 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: C.slate200 }}
                    >
                      <MaterialIcons name="restaurant" size={28} color={C.slate500} />
                    </View>
                  )}
                  <View style={{ flex: 1, padding: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.slate900, marginBottom: 4 }} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <MaterialIcons name="check-circle" size={12} color={C.green} />
                        <Text style={{ fontSize: 11, color: C.green, fontWeight: '600' }}>
                          {recipe.usedIngredientCount} have
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <MaterialIcons name="add-shopping-cart" size={12} color={C.slate500} />
                        <Text style={{ fontSize: 11, color: C.slate500 }}>
                          {recipe.missedIngredientCount} need
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ justifyContent: 'center', paddingRight: 12 }}>
                    <MaterialIcons name="chevron-right" size={20} color={C.slate300} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

type ListItem =
  | { type: 'summary'; store: Store }
  | { type: 'sectionHeader'; count: number }
  | { type: 'storeRow'; store: Store; index: number };

export const MarketMapScreen: React.FC = () => {
  const navigation = useNavigation<MapNavProp>();
  const route = useRoute<MapRouteProp>();
  const missingIngredients: string[] = route.params?.missingIngredients ?? [];

  const { stores, loading, error, radiusKm, fetch: fetchStores } = useNearbyStores();
  const {
    suggestions,
    loading: suggestLoading,
    error: suggestError,
    fetch: fetchSuggestions,
    clear: clearSuggestions,
  } = useRecipeSuggestions();
  const [showAlternatives, setShowAlternatives] = useState(false);

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [selected, setSelected] = useState<Store | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);

  // Map container dimensions (for pin overlay in full-map mode)
  const [mapContainerW, setMapContainerW] = useState(SW);
  const [mapContainerH, setMapContainerH] = useState(NORMAL_MAP_H);

  const [normalMapUrl, setNormalMapUrl] = useState<string | null>(null);
  const [fullMapUrl, setFullMapUrl] = useState<string | null>(null);
  const [mapImageLoading, setMapImageLoading] = useState(false);

  // Full-map view center/zoom — changes when user taps a pin to zoom in
  const [fullCenter, setFullCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [fullZoom, setFullZoom] = useState(MAP_ZOOM);
  const isExpoGo = Constants.appOwnership === 'expo';

  const MapboxGL = useMemo(() => {
    if (isExpoGo) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@rnmapbox/maps').default;
      if (MAPBOX_TOKEN) mod.setAccessToken(MAPBOX_TOKEN);
      return mod;
    } catch {
      return null;
    }
  }, [isExpoGo]);
  const useNativeMap = !!MapboxGL && Platform.OS !== 'web' && !isExpoGo;
  const cameraRef = useRef<any>(null);

  const topPad = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const isLoading = locLoading || loading;

  // ── GPS ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLocLoading(true);
      const fallback = { lat: 10.7769, lng: 106.7009 };
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocError('Location permission denied — showing default area.');
          setUserLat(fallback.lat);
          setUserLng(fallback.lng);
          fetchStores(fallback.lat, fallback.lng);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        fetchStores(pos.coords.latitude, pos.coords.longitude);
      } catch {
        setLocError('Could not get GPS — using default location.');
        setUserLat(fallback.lat);
        setUserLng(fallback.lng);
        fetchStores(fallback.lat, fallback.lng);
      } finally {
        setLocLoading(false);
      }
    })();
  }, []);

  // ── Rebuild map URLs ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (userLat == null || userLng == null) return;
    // By passing 'null' instead of 'selected' to normalMapUrl, it avoids reloading
    // the static map image entirely when simply tapping different stores in the list mode.
    setNormalMapUrl(buildMapUrl(userLat, userLng, null, stores, SW, NORMAL_MAP_H, true, MAP_ZOOM, userLat, userLng));
    const fc = fullCenter ?? { lat: userLat, lng: userLng };
    const newUrl = buildMapUrl(fc.lat, fc.lng, null, stores, mapContainerW, mapContainerH, false, fullZoom, userLat, userLng);
    if (!useNativeMap && newUrl !== fullMapUrl) setMapImageLoading(true);
    setFullMapUrl(newUrl);
  }, [userLat, userLng, stores, mapContainerW, mapContainerH, fullCenter, fullZoom, useNativeMap]);

  // ── Init native Mapbox camera ───────────────────────────────────────────────
  useEffect(() => {
    if (!useNativeMap || userLat == null || userLng == null || !cameraRef.current) return;
    cameraRef.current.setCamera({
      centerCoordinate: [userLng, userLat],
      zoomLevel: MAP_ZOOM,
      animationDuration: 0,
    });
  }, [useNativeMap, userLat, userLng]);

  const handleCameraChanged = useCallback((e: any) => {
    const props = e?.properties ?? {};
    if (Array.isArray(props.center) && props.center.length >= 2) {
      setFullCenter({ lng: props.center[0], lat: props.center[1] });
    }
    if (typeof props.zoom === 'number') {
      setFullZoom(props.zoom);
    }
  }, []);

  // ── Auto-select first store ───────────────────────────────────────────────────
  useEffect(() => {
    if (stores.length > 0 && selected === null) setSelected(stores[0]);
  }, [stores]);

  const handleTabPress = (tabId: string) => {
    if (tabId === 'cook') navigation.navigate('Home');
    if (tabId === 'inventory') navigation.navigate('Inventory');
    if (tabId === 'settings') navigation.navigate('Settings');
  };

  const onMapLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMapContainerW(width);
    setMapContainerH(height);
  }, []);

  // ── FlatList data (normal mode) ───────────────────────────────────────────────
  const listData: ListItem[] = [];
  if (selected) listData.push({ type: 'summary', store: selected });
  listData.push({ type: 'sectionHeader', count: stores.length });
  stores.forEach((store, index) => listData.push({ type: 'storeRow', store, index }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ListItem>) => {
      if (item.type === 'summary') {
        return (
          <InlineSummaryCard
            store={item.store}
            onClose={() => setSelected(null)}
            missingIngredients={missingIngredients}
            onFindAlternatives={openAlternatives}
          />
        );
      }
      if (item.type === 'sectionHeader') {
        return (
          <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: C.slate700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {item.count > 0
                ? `${item.count} stores near you`
                : isLoading ? 'Searching…' : 'No results'}
            </Text>
          </View>
        );
      }
      return (
        <StoreRow
          store={item.store}
          index={item.index}
          selected={selected?.id === item.store.id}
          onPress={() => { setSelected(item.store); setMapExpanded(false); }}
          missingIngredients={missingIngredients}
        />
      );
    },
    [selected, isLoading],
  );

  const keyExtractor = useCallback((item: ListItem) => {
    if (item.type === 'summary') return 'summary';
    if (item.type === 'sectionHeader') return 'header';
    return item.store.id;
  }, []);

  const flyTo = useCallback(
    (center: { lat: number; lng: number }, zoom: number, duration = 600) => {
      if (!useNativeMap || !cameraRef.current) return;
      cameraRef.current.setCamera({
        centerCoordinate: [center.lng, center.lat],
        zoomLevel: zoom,
        animationDuration: duration,
      });
    },
    [useNativeMap],
  );

  // ── Helper: select a store and zoom the full map in on it ──────────────────────
  const selectAndZoom = useCallback((store: Store | null) => {
    setSelected(store);
    if (store?.lat != null && store?.lng != null) {
      const next = { lat: store.lat, lng: store.lng };
      setFullCenter(next);
      setFullZoom(16);
      flyTo(next, 16);
    } else if (userLat != null && userLng != null) {
      const next = { lat: userLat, lng: userLng };
      setFullCenter(null);
      setFullZoom(MAP_ZOOM);
      flyTo(next, MAP_ZOOM, 300);
    }
  }, [userLat, userLng, flyTo]);

  // ── Zoom back out to overview ────────────────────────────────────────────────
  const zoomOut = useCallback(() => {
    setFullCenter(null);
    setFullZoom(MAP_ZOOM);
    setSelected(null);
    if (userLat != null && userLng != null) {
      flyTo({ lat: userLat, lng: userLng }, MAP_ZOOM, 350);
    }
  }, [userLat, userLng, flyTo]);

  // ── Manual zoom buttons ───────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    const next = Math.min(fullZoom + 1, ZOOM_MAX);
    setFullZoom(next);
    const center = fullCenter ?? (userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null);
    if (center) flyTo(center, next, 250);
  }, [fullZoom, fullCenter, userLat, userLng, flyTo]);
  const zoomOutStep = useCallback(() => {
    const next = Math.max(fullZoom - 1, ZOOM_MIN);
    setFullZoom(next);
    if (next <= MAP_ZOOM) { setFullCenter(null); setSelected(null); }
    const center = fullCenter ?? (userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null);
    if (center) flyTo(center, next, 250);
  }, [fullZoom, fullCenter, userLat, userLng, flyTo]);

  // ── Open alternatives modal ───────────────────────────────────────────────────
  const openAlternatives = useCallback(() => {
    // Suggest based on ingredients user DOES have (all ingredients minus the missing ones)
    // Since we only have the missing list, pass them to find recipes that use those items
    fetchSuggestions(missingIngredients.length > 0 ? missingIngredients : ['chicken', 'garlic', 'onion']);
    setShowAlternatives(true);
  }, [missingIngredients, fetchSuggestions]);

  // ── Overlay pin positions (full-map mode, computed from current center/zoom) ──
  const pinCenterLat = fullCenter?.lat ?? userLat ?? 0;
  const pinCenterLng = fullCenter?.lng ?? userLng ?? 0;
  const overlayPins = (userLat != null && mapContainerW > 0 && mapContainerH > 0)
    ? stores
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => ({
        store: s,
        ...latLngToPixel(s.lat!, s.lng!, pinCenterLat, pinCenterLng, fullZoom, mapContainerW, mapContainerH),
      }))
    : [];

  // ── Pan + Pinch gestures (Expo Go friendly, no native module needed) ──────────
  const pinchBaseZoom = useRef(fullZoom);
  const pinchBaseDist = useRef(0);
  const pinchScaleAnim = useRef(new Animated.Value(1)).current;
  const panTranslate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isPinching = useRef(false);
  const isPanning = useRef(false);
  const panBaseCenter = useRef<{ lat: number; lng: number } | null>(null);

  function getTouchDist(touches: { pageX: number; pageY: number }[]) {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const mapGestureResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_: GestureResponderEvent, gs: PanResponderGestureState) => gs.numberActiveTouches === 2,
      onStartShouldSetPanResponderCapture: (_: GestureResponderEvent, gs: PanResponderGestureState) => gs.numberActiveTouches === 2,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.numberActiveTouches === 2) return true;
        if (gs.numberActiveTouches === 1) {
          return Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4;
        }
        return false;
      },
      onMoveShouldSetPanResponderCapture: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.numberActiveTouches === 2) return true;
        if (gs.numberActiveTouches === 1) {
          return Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3;
        }
        return false;
      },
      onPanResponderGrant: (e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.numberActiveTouches === 2 && e.nativeEvent.touches.length === 2) {
          isPinching.current = true;
          pinchBaseDist.current = getTouchDist([...e.nativeEvent.touches]);
          pinchBaseZoom.current = fullZoom;
          return;
        }
        if (gs.numberActiveTouches === 1) {
          isPanning.current = true;
          if (userLat != null && userLng != null) {
            panBaseCenter.current = fullCenter ?? { lat: userLat, lng: userLng };
          }
          panTranslate.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (e.nativeEvent.touches.length === 2 && isPinching.current) {
          const dist = getTouchDist([...e.nativeEvent.touches]);
          if (pinchBaseDist.current === 0) return;
          const scale = dist / pinchBaseDist.current;
          pinchScaleAnim.setValue(Math.max(0.5, Math.min(scale, 3)));
          return;
        }
        if (e.nativeEvent.touches.length === 1) {
          if (!isPanning.current) {
            isPanning.current = true;
            if (userLat != null && userLng != null) {
              panBaseCenter.current = fullCenter ?? { lat: userLat, lng: userLng };
            }
            panTranslate.setValue({ x: 0, y: 0 });
          }
          panTranslate.setValue({ x: gs.dx, y: gs.dy });
        }
      },
      onPanResponderRelease: (e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (isPinching.current) {
          isPinching.current = false;
          const touches = e.nativeEvent.touches.length >= 2
            ? [...e.nativeEvent.touches]
            : e.nativeEvent.changedTouches.length >= 2
              ? [...e.nativeEvent.changedTouches]
              : null;
          if (touches && pinchBaseDist.current > 0) {
            const dist = getTouchDist(touches);
            const scale = dist / pinchBaseDist.current;
            const deltaZoom = Math.log2(Math.max(0.1, scale)) * 1.5;
            const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX,
              pinchBaseZoom.current + deltaZoom));
            const snapped = Math.round(newZoom * 2) / 2;
            pinchScaleAnim.setValue(1);
            setFullZoom(snapped);
            if (snapped <= MAP_ZOOM) { setFullCenter(null); setSelected(null); }
          } else {
            pinchScaleAnim.setValue(1);
          }
        }

        if (isPanning.current) {
          isPanning.current = false;
          const base = panBaseCenter.current;
          if (base) {
            const worldPx = Math.pow(2, fullZoom) * 256;
            const frac = mercatorFrac(base.lat, base.lng);
            const nextX = frac.x - gs.dx / worldPx;
            const nextY = frac.y - gs.dy / worldPx;
            const clampedY = Math.max(0.02, Math.min(0.98, nextY));
            const next = mercatorToLatLng(nextX, clampedY);
            setFullCenter(next);
          }
          panTranslate.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderTerminate: () => {
        isPinching.current = false;
        isPanning.current = false;
        pinchScaleAnim.setValue(1);
        panTranslate.setValue({ x: 0, y: 0 });
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100, paddingTop: topPad }}>
      <StatusBar style="dark" />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          height: 56,
          backgroundColor: C.white,
          borderBottomWidth: 1,
          borderBottomColor: C.slate200,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          style={{
            width: 34, height: 34, borderRadius: 17,
            backgroundColor: C.greenLight,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <MaterialIcons name="arrow-back" size={19} color={C.green} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: C.slate900 }}>
            Nearby Stores
          </Text>
          {!isLoading && userLat != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="my-location" size={10} color={C.green} />
              <Text style={{ fontSize: 10, color: C.slate500 }}>
                {stores.length > 0 ? `${stores.length} stores found near you` : 'No stores found'}
              </Text>
            </View>
          )}
        </View>

        {/* Toggle full map / list */}
        <TouchableOpacity
          onPress={() => {
            if (mapExpanded) {
              setFullCenter(null);
              setFullZoom(MAP_ZOOM);
            }
            setMapExpanded((v) => !v);
          }}
          activeOpacity={0.75}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 20,
            backgroundColor: mapExpanded ? C.green : C.greenLight,
            borderWidth: 1.5,
            borderColor: mapExpanded ? C.green : '#bbf7d0',
          }}
        >
          <MaterialIcons
            name={mapExpanded ? 'view-list' : 'map'}
            size={15}
            color={mapExpanded ? C.white : C.green}
          />
          <Text style={{ fontSize: 12, fontWeight: '700', color: mapExpanded ? C.white : C.green }}>
            {mapExpanded ? 'List' : 'Full Map'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── MISSING ITEMS BANNER ────────────────────────────────────────── */}
      {missingIngredients.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: C.greenLight,
            borderBottomWidth: 1,
            borderBottomColor: '#bbf7d0',
          }}
        >
          <MaterialIcons name="shopping-cart" size={14} color={C.green} />
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: '#065f46' }} numberOfLines={1}>
            Shopping for {missingIngredients.length} item{missingIngredients.length !== 1 ? 's' : ''}:{' '}
            {missingIngredients.slice(0, 3).join(', ')}
            {missingIngredients.length > 3 ? ` +${missingIngredients.length - 3} more` : ''}
          </Text>
          <TouchableOpacity onPress={openAlternatives} hitSlop={8}>
            <MaterialIcons name="auto-awesome" size={16} color={C.amber} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── RADIUS EXPANDED NOTICE ──────────────────────────────────────── */}
      {!isLoading && radiusKm > 5 && stores.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 6,
            backgroundColor: C.amberLight,
            borderBottomWidth: 1,
            borderBottomColor: '#fde68a',
          }}
        >
          <MaterialIcons name="info-outline" size={13} color={C.amber} />
          <Text style={{ fontSize: 11, color: '#92400e', fontWeight: '600' }}>
            No stores found within 5 km — expanded to {radiusKm} km
          </Text>
        </View>
      )}

      {/* ── LOADING BANNER ──────────────────────────────────────────────── */}
      {isLoading && (
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: 8, paddingVertical: 8, backgroundColor: C.greenLight,
          }}
        >
          <ActivityIndicator size="small" color={C.green} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.green }}>
            {locLoading ? 'Getting your location…' : 'Finding nearby stores…'}
          </Text>
        </View>
      )}

      {/* ── ERROR BANNER ────────────────────────────────────────────────── */}
      {(locError || (error && !isLoading)) && (
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            marginHorizontal: 12, marginTop: 8, padding: 10,
            backgroundColor: C.amberLight, borderRadius: 12,
            borderWidth: 1, borderColor: '#fde68a',
          }}
        >
          <MaterialIcons name="info-outline" size={14} color={C.amber} />
          <Text style={{ fontSize: 11, color: '#92400e', flex: 1 }}>{locError ?? error}</Text>
        </View>
      )}

      {/* ════════════════════════════════════════════════════════════════
          FULL MAP MODE: map fills remaining space, overlay pins, bottom chips
         ════════════════════════════════════════════════════════════════ */}
      {mapExpanded ? (
        <View style={{ flex: 1, position: 'relative' }} onLayout={onMapLayout}>
          {useNativeMap ? (
            <View style={{ flex: 1 }}>
              <MapboxGL.MapView
                style={{ flex: 1 }}
                styleURL="mapbox://styles/mapbox/light-v11"
                compassEnabled
                scaleBarEnabled={false}
                logoEnabled={false}
                attributionEnabled={false}
                onCameraChanged={handleCameraChanged}
              >
                <MapboxGL.Camera ref={cameraRef} />
                <MapboxGL.UserLocation visible animated />

                {(stores ?? []).map((store, idx) =>
                  store.lat != null && store.lng != null ? (
                    <MapboxGL.MarkerView
                      key={store.id}
                      id={store.id}
                      coordinate={[store.lng, store.lat]}
                    >
                      <TouchableOpacity
                        onPress={() => selectAndZoom(store)}
                        activeOpacity={0.85}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: selected?.id === store.id ? C.orange : statusMeta(store).color,
                          borderWidth: 3,
                          borderColor: C.white,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.35,
                          shadowRadius: 5,
                          elevation: 8,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '900', color: C.white }}>
                          {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    </MapboxGL.MarkerView>
                  ) : null,
                )}
              </MapboxGL.MapView>
            </View>
          ) : (
            <>
              {/* Map image — static fallback with PanResponder */}
              <Animated.View
                style={{
                  width: '100%',
                  height: '100%',
                  transform: [
                    { translateX: panTranslate.x },
                    { translateY: panTranslate.y },
                    { scale: pinchScaleAnim },
                  ],
                }}
                {...mapGestureResponder.panHandlers}
              >
                {fullMapUrl ? (
                  <Image
                    key={fullMapUrl}
                    source={{ uri: fullMapUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    onLoadEnd={() => setMapImageLoading(false)}
                  />
                ) : (
                  <View style={{ flex: 1, backgroundColor: '#dde6d5', alignItems: 'center', justifyContent: 'center' }}>
                    {isLoading
                      ? <ActivityIndicator size="large" color={C.green} />
                      : <MaterialIcons name="map" size={44} color={C.slate300} />}
                  </View>
                )}
              </Animated.View>

              {/* ── Overlay tappable pins (static map) ───────────────────── */}
              <Animated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  transform: [
                    { translateX: panTranslate.x },
                    { translateY: panTranslate.y },
                    { scale: pinchScaleAnim },
                  ],
                }}
                pointerEvents="box-none"
              >
                {overlayPins.map(({ store, x, y }, idx) => {
                  const isSel = selected?.id === store.id;
                  const { color } = statusMeta(store);
                  // Skip pins far outside visible area
                  if (x < -40 || x > mapContainerW + 40 || y < -40 || y > mapContainerH + 40) return null;
                  return (
                    <TouchableOpacity
                      key={store.id}
                      onPress={() => selectAndZoom(isSel ? null : store)}
                      activeOpacity={0.75}
                      hitSlop={8}
                      style={{
                        position: 'absolute',
                        left: x - PIN_SIZE / 2,
                        top: y - PIN_SIZE / 2,
                        width: PIN_SIZE,
                        height: PIN_SIZE,
                        borderRadius: PIN_SIZE / 2,
                        backgroundColor: isSel ? C.orange : color,
                        borderWidth: 3,
                        borderColor: C.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.35,
                        shadowRadius: 5,
                        elevation: 8,
                        transform: [{ scale: isSel ? 1.35 : 1 }],
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '900', color: C.white }}>
                        {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            </>
          )}

          {/* ── Map loading overlay (static only) ─────────────────────── */}
          {!useNativeMap && mapImageLoading && (
            <View
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.55)',
                alignItems: 'center', justifyContent: 'center',
              }}
              pointerEvents="none"
            >
              <ActivityIndicator size="large" color={C.green} />
            </View>
          )}

          {/* ── Zoom buttons (right side) ─────────────────────────────── */}
          <View
            style={{
              position: 'absolute',
              right: 12,
              top: selected ? 130 : 12,
              gap: 6,
            }}
          >
            {/* Zoom In */}
            <TouchableOpacity
              onPress={zoomIn}
              activeOpacity={0.8}
              disabled={fullZoom >= ZOOM_MAX}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: fullZoom >= ZOOM_MAX ? C.slate200 : C.white,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15, shadowRadius: 4, elevation: 5,
                borderWidth: 1, borderColor: C.slate200,
              }}
            >
              <MaterialIcons name="add" size={22} color={fullZoom >= ZOOM_MAX ? C.slate300 : C.slate700} />
            </TouchableOpacity>
            {/* Zoom level badge */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: C.slate500 }}>
                {Math.round(fullZoom)}x
              </Text>
            </View>
            {/* Zoom Out */}
            <TouchableOpacity
              onPress={zoomOutStep}
              activeOpacity={0.8}
              disabled={fullZoom <= ZOOM_MIN}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: fullZoom <= ZOOM_MIN ? C.slate200 : C.white,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15, shadowRadius: 4, elevation: 5,
                borderWidth: 1, borderColor: C.slate200,
              }}
            >
              <MaterialIcons name="remove" size={22} color={fullZoom <= ZOOM_MIN ? C.slate300 : C.slate700} />
            </TouchableOpacity>
            {/* Reset overview button */}
            {fullZoom > MAP_ZOOM + 0.5 && (
              <TouchableOpacity
                onPress={zoomOut}
                activeOpacity={0.85}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: C.greenLight,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12, shadowRadius: 4, elevation: 4,
                  borderWidth: 1, borderColor: '#bbf7d0',
                }}
              >
                <MaterialIcons name="zoom-out-map" size={18} color={C.green} />
              </TouchableOpacity>
            )}
            {/* Pinch hint */}
            <View style={{ alignItems: 'center', marginTop: 4 }}>
              <MaterialIcons name="pinch" size={16} color={C.slate300} />
            </View>
          </View>

          {/* ── Small popup card (top of map) ─────────────────────────── */}
          {selected != null && !isLoading && (
            <MapPopupCard store={selected} onClose={zoomOut} missingIngredients={missingIngredients} onFindAlternatives={openAlternatives} />
          )}

          {/* ── Bottom horizontal store chips ─────────────────────────── */}
          <View
            style={{
              position: 'absolute',
              bottom: NAV_H + 8,
              left: 0,
              right: 0,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 12 }}
            >
              {stores.map((store, idx) => (
                <StoreChip
                  key={store.id}
                  store={store}
                  index={idx}
                  selected={selected?.id === store.id}
                  onPress={() => selectAndZoom(selected?.id === store.id ? null : store)}
                />
              ))}
            </ScrollView>
          </View>
        </View>

      ) : (
        /* ════════════════════════════════════════════════════════════════
           NORMAL MODE: map (38%) + scrollable list
           ════════════════════════════════════════════════════════════════ */
        <>
          {/* Map image with "Expand" hint */}
          <TouchableOpacity
            activeOpacity={0.97}
            onPress={() => setMapExpanded(true)}
            style={{ height: NORMAL_MAP_H }}
          >
            {normalMapUrl ? (
              <Image
                key={normalMapUrl}
                source={{ uri: normalMapUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: '#dde6d5', alignItems: 'center', justifyContent: 'center' }}>
                {isLoading
                  ? <ActivityIndicator size="large" color={C.green} />
                  : <MaterialIcons name="map" size={44} color={C.slate300} />}
              </View>
            )}
            <View
              style={{
                position: 'absolute', bottom: 10, right: 10,
                backgroundColor: C.green,
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                flexDirection: 'row', alignItems: 'center', gap: 5,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
              }}
            >
              <MaterialIcons name="open-in-full" size={13} color={C.white} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.white }}>Expand map</Text>
            </View>
          </TouchableOpacity>

          {/* Store list */}
          <FlatList
            data={listData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 96 }}
            ListEmptyComponent={
              !isLoading ? (
                <View style={{ alignItems: 'center', paddingTop: 40, paddingHorizontal: 24, gap: 10 }}>
                  <MaterialIcons name="search-off" size={44} color={C.slate300} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.slate700 }}>No stores found</Text>
                  <Text style={{ fontSize: 13, color: C.slate500, textAlign: 'center' }}>
                    No grocery stores found within {radiusKm} km of your location.
                  </Text>
                  {missingIngredients.length > 0 && (
                    <TouchableOpacity
                      onPress={openAlternatives}
                      activeOpacity={0.85}
                      style={{
                        marginTop: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: C.amberLight,
                        borderWidth: 1,
                        borderColor: '#fde68a',
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        borderRadius: 14,
                      }}
                    >
                      <MaterialIcons name="auto-awesome" size={18} color={C.amber} />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.amber }}>
                        Find alternative recipes
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
          />
        </>
      )}

      <BottomNavBar initialActive="stores" onTabPress={handleTabPress} />

      {/* ── ALTERNATIVES MODAL ────────────────────────────────────────── */}
      <AlternativesModal
        visible={showAlternatives}
        onClose={() => { setShowAlternatives(false); clearSuggestions(); }}
        suggestions={suggestions}
        loading={suggestLoading}
        error={suggestError}
        missingIngredients={missingIngredients}
        onSelectRecipe={(id, title, image) => {
          setShowAlternatives(false);
          navigation.navigate('IngredientChecklist', {
            recipeId: id,
            recipeTitle: title,
            recipeImage: image ?? undefined,
          });
        }}
      />
    </View>
  );
};
