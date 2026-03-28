export interface Store {
  id: string;
  name: string;
  address: string;
  distance: string;
  driveTime: string;
  availableItems: number;
  totalItems: number;
  estimatedCost: number;
  isTopPick?: boolean;
  hasMissingItems?: boolean;
  lat?: number;
  lng?: number;
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
