import type { Ref } from 'react';
import type { Store } from '../types/store';

export interface NativeMapboxViewProps {
  cameraRef?: Ref<any>;
  stores: Store[];
  selectedId: string | null;
  onSelectStore?: (store: Store) => void;
  onCameraChanged?: (center: { lat: number; lng: number }, zoom: number) => void;
  onUnavailable?: () => void;
}
