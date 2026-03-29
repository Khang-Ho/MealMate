import React, { useEffect, useMemo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Constants from 'expo-constants';
import type { NativeMapboxViewProps } from './NativeMapboxView.types';
import type { Store } from '../types/store';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

function statusColor(store: Store, isSelected: boolean) {
  if (isSelected) return '#F97316';
  if (store.isTopPick) return '#059669';
  if (store.hasMissingItems) return '#d97706';
  return '#2563eb';
}

export const NativeMapboxView: React.FC<NativeMapboxViewProps> = ({
  cameraRef,
  stores,
  selectedId,
  onSelectStore,
  onCameraChanged,
  onUnavailable,
}) => {
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

  useEffect(() => {
    if (!MapboxGL) onUnavailable?.();
  }, [MapboxGL, onUnavailable]);

  if (!MapboxGL) return null;

  return (
    <View style={{ flex: 1 }}>
      <MapboxGL.MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/light-v11"
        compassEnabled
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        onCameraChanged={(e: any) => {
          const props = e?.properties ?? {};
          if (Array.isArray(props.center) && props.center.length >= 2 && typeof props.zoom === 'number') {
            onCameraChanged?.({ lng: props.center[0], lat: props.center[1] }, props.zoom);
          }
        }}
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
                onPress={() => onSelectStore?.(store)}
                activeOpacity={0.85}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: statusColor(store, selectedId === store.id),
                  borderWidth: 3,
                  borderColor: '#ffffff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.35,
                  shadowRadius: 5,
                  elevation: 8,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#ffffff' }}>
                  {idx + 1}
                </Text>
              </TouchableOpacity>
            </MapboxGL.MarkerView>
          ) : null,
        )}
      </MapboxGL.MapView>
    </View>
  );
};
