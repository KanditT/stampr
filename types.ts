
export type StampStyle = 'Classical Manuscript' | 'Jazz Lead Sheet' | 'Golden Record';

export interface Stamp {
  id: string;
  locationId: string;
  locationName: string;
  style: StampStyle;
  collectedAt: number;
  lore: string;
  color: string;
  symbol: string;
  x: number; // Horizontal percentage (0-100)
  y: number; // Vertical offset in pixels
  rotation: number;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  hint: string;
  symbols: string[];
}

export interface AppState {
  hasBook: boolean;
  collectedStamps: Record<string, Stamp>;
}

export interface PendingStamp extends Partial<Stamp> {
  isPlacing: boolean;
}
