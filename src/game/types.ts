export type Color =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'brown'
  | 'lime';

export const ALL_COLORS: Color[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'pink',
  'teal',
  'brown',
  'lime',
];

export const COLOR_VALUES: Record<Color, string> = {
  red: '#E74C3C',
  blue: '#3498DB',
  green: '#27AE60',
  yellow: '#F1C40F',
  purple: '#9B59B6',
  orange: '#F39C12',
  pink: '#FF69B4',
  teal: '#00CED1',
  brown: '#8B5E3C',
  lime: '#A8D829',
};

export const VIAL_CAPACITY = 4;

/** A vial is an array of colors, index 0 = bottom, last = top. Max length = VIAL_CAPACITY. */
export type Vial = Color[];

export interface Move {
  from: number;
  to: number;
  count: number;
}

export const UNDO_COST = 1;
export const SHUFFLE_COST = 3;
export const ADD_VIAL_COST = 5;

export interface GameState {
  vials: Vial[];
  selectedVial: number | null;
  moveHistory: Move[];
  level: number;
  moveCount: number;
  coins: number;
  addedVial: boolean;
  won: boolean;
}
