export interface Store {
  id: string;
  name: string;
  address: string;
  distance: string;
  distanceKm: number;
  driveTime: string;
  availableItems: number;
  totalItems: number;
  estimatedCost: number;
  isTopPick?: boolean;
  hasMissingItems?: boolean;
  lat?: number;
  lng?: number;
  rating?: number | null;
  totalRatings?: number | null;
  isOpen?: boolean | null;
  placeId?: string;
}

export interface StoreMarkerData {
  id: string;
  name: string;
  label: string;
  topPercent: number;
  leftPercent: number;
  isTopPick?: boolean;
  hasMissing?: boolean;
}
