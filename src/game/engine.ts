import { type Color, type GameState, type Vial, VIAL_CAPACITY } from './types';

/** Returns the top color of a vial, or undefined if empty. */
export function getTopColor(vial: Vial): Color | undefined {
  return vial.length > 0 ? vial[vial.length - 1] : undefined;
}

/** Returns how many consecutive same-colored segments are on top. */
export function getTopCount(vial: Vial): number {
  if (vial.length === 0) return 0;
  const topColor = vial[vial.length - 1];
  let count = 0;
  for (let i = vial.length - 1; i >= 0; i--) {
    if (vial[i] === topColor) count++;
    else break;
  }
  return count;
}

/** Checks whether pouring from source into dest is a valid move. */
export function canPour(source: Vial, dest: Vial): boolean {
  if (source.length === 0) return false;
  if (dest.length >= VIAL_CAPACITY) return false;
  if (dest.length === 0) return true;
  return getTopColor(source) === getTopColor(dest);
}

/**
 * Performs a pour from vials[fromIndex] into vials[toIndex].
 * Returns a new GameState (immutable). Returns null if the pour is invalid.
 */
export function pour(state: GameState, fromIndex: number, toIndex: number): GameState | null {
  const source = state.vials[fromIndex];
  const dest = state.vials[toIndex];

  if (fromIndex === toIndex) return null;
  if (!canPour(source, dest)) return null;

  // Don't allow pouring from a completed single-color vial
  if (isVialComplete(source)) return null;

  const topColor = getTopColor(source)!;
  const available = VIAL_CAPACITY - dest.length;
  const topCount = getTopCount(source);
  const count = Math.min(topCount, available);

  const newSource: Vial = source.slice(0, source.length - count);
  const newDest: Vial = [...dest, ...Array<Color>(count).fill(topColor as Color)];

  const newVials: Vial[] = state.vials.map((v, i) => {
    if (i === fromIndex) return newSource;
    if (i === toIndex) return newDest;
    return v;
  });

  const newState: GameState = {
    ...state,
    vials: newVials,
    selectedVial: null,
    moveHistory: [...state.moveHistory, { from: fromIndex, to: toIndex, count }],
    moveCount: state.moveCount + 1,
  };

  return { ...newState, won: checkWin(newState) };
}

/** A vial is complete if it has exactly VIAL_CAPACITY segments of the same color. */
function isVialComplete(vial: Vial): boolean {
  return vial.length === VIAL_CAPACITY && vial.every((c) => c === vial[0]);
}

/** Checks if the game is won: every vial is either empty or complete. */
export function checkWin(state: GameState): boolean {
  return state.vials.every(
    (vial) => vial.length === 0 || isVialComplete(vial)
  );
}

/** Undoes the last move. Returns new state or null if no moves to undo. */
export function undo(state: GameState): GameState | null {
  if (state.moveHistory.length === 0) return null;

  const lastMove = state.moveHistory[state.moveHistory.length - 1];
  const { from, to, count } = lastMove;

  const source = state.vials[to]; // the pour target becomes the undo source
  const dest = state.vials[from]; // the pour source becomes the undo target

  const movedSegments = source.slice(source.length - count);
  const newSource = source.slice(0, source.length - count);
  const newDest = [...dest, ...movedSegments];

  const newVials = state.vials.map((v, i) => {
    if (i === to) return newSource;
    if (i === from) return newDest;
    return v;
  });

  return {
    ...state,
    vials: newVials,
    selectedVial: null,
    moveHistory: state.moveHistory.slice(0, -1),
    moveCount: state.moveCount - 1,
    won: false,
  };
}

/** Shuffles the contents of a single vial. Returns new state. */
export function shuffleVial(state: GameState, vialIndex: number): GameState {
  const vial = state.vials[vialIndex];
  if (vial.length <= 1) return state;

  // Fisher-Yates shuffle
  const shuffled: Vial = [...vial];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const newVials: Vial[] = state.vials.map((v, i) =>
    i === vialIndex ? shuffled : v
  );

  return {
    ...state,
    vials: newVials,
    selectedVial: null,
  };
}

/** Adds an empty vial to the game. Returns new state. */
export function addEmptyVial(state: GameState): GameState {
  return {
    ...state,
    vials: [...state.vials, []],
    addedVial: true,
    selectedVial: null,
  };
}

/** Returns true if any valid pour exists on the board. */
export function hasMovesLeft(state: GameState): boolean {
  for (let i = 0; i < state.vials.length; i++) {
    const source = state.vials[i];
    if (source.length === 0) continue;
    if (source.length === VIAL_CAPACITY && source.every((c) => c === source[0])) continue;
    for (let j = 0; j < state.vials.length; j++) {
      if (i === j) continue;
      if (canPour(source, state.vials[j])) return true;
    }
  }
  return false;
}

/** Calculates coin reward for completing a level. */
export function calculateReward(level: number, moveCount: number): number {
  // Base reward scales with level, bonus for efficiency
  const base = Math.min(3 + Math.floor(level / 5), 8);
  const efficiency = Math.max(0, 30 - moveCount);
  const bonus = Math.floor(efficiency / 10);
  return base + bonus;
}
