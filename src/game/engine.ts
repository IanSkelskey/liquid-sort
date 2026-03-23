import { type Color, type GameState, type Vial, VIAL_CAPACITY } from './types';

/** Reveals the top segment of each vial (hidden segments become visible when on top). */
export function revealTopSegments(state: GameState): GameState {
  let changed = false;
  const newHidden = state.hidden.map((vialHidden, vi) => {
    const vial = state.vials[vi];
    if (vial.length === 0) return vialHidden;
    const topIdx = vial.length - 1;
    if (topIdx < vialHidden.length && vialHidden[topIdx]) {
      changed = true;
      const copy = [...vialHidden];
      copy[topIdx] = false;
      return copy;
    }
    return vialHidden;
  });
  return changed ? { ...state, hidden: newHidden } : state;
}

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

  // Don't allow pouring from a completed single-color vial (only if fully revealed)
  const fromHidden = state.hidden[fromIndex] ?? [];
  if (isVialComplete(source) && !fromHidden.some((h) => h)) return null;

  const topColor = getTopColor(source)!;
  const available = VIAL_CAPACITY - dest.length;
  // Don't count hidden segments as part of the top group
  const sourceHidden = state.hidden[fromIndex] ?? [];
  let topCount = 0;
  for (let i = source.length - 1; i >= 0; i--) {
    if (source[i] === topColor && !sourceHidden[i]) topCount++;
    else break;
  }
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
    hidden: state.hidden.map((vh, vi) => {
      if (vi === fromIndex) return vh.slice(0, newSource.length);
      if (vi === toIndex) return [...vh, ...Array<boolean>(count).fill(false)];
      return vh;
    }),
  };

  const revealed = revealTopSegments(newState);
  return { ...revealed, won: checkWin(revealed) };
}

/** A vial is complete if it has exactly VIAL_CAPACITY segments of the same color. */
function isVialComplete(vial: Vial): boolean {
  return vial.length === VIAL_CAPACITY && vial.every((c) => c === vial[0]);
}

/** Checks if the game is won: every vial is either empty or complete with no hidden segments. */
export function checkWin(state: GameState): boolean {
  return state.vials.every(
    (vial, i) =>
      vial.length === 0 ||
      (isVialComplete(vial) && !(state.hidden[i]?.some((h) => h)))
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

  return revealTopSegments({
    ...state,
    vials: newVials,
    selectedVial: null,
    moveHistory: state.moveHistory.slice(0, -1),
    moveCount: state.moveCount - 1,
    won: false,
    hidden: state.hidden.map((vh, vi) => {
      if (vi === to) return vh.slice(0, newSource.length);
      if (vi === from) return [...vh, ...Array<boolean>(count).fill(false)];
      return vh;
    }),
  });
}

/** Shuffles the contents of a single vial. Returns new state. */
export function shuffleVial(state: GameState, vialIndex: number): GameState {
  const vial = state.vials[vialIndex];
  if (vial.length <= 1) return state;

  const vialHidden = state.hidden[vialIndex] ?? [];

  // Collect indices and colors of only revealed segments
  const revealedIndices: number[] = [];
  const revealedColors: Color[] = [];
  for (let i = 0; i < vial.length; i++) {
    if (!vialHidden[i]) {
      revealedIndices.push(i);
      revealedColors.push(vial[i]);
    }
  }

  if (revealedColors.length <= 1) return state;

  // Fisher-Yates shuffle on revealed colors only, retry if unchanged
  let shuffledColors: Color[];
  let attempts = 0;
  do {
    shuffledColors = [...revealedColors];
    for (let i = shuffledColors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledColors[i], shuffledColors[j]] = [shuffledColors[j], shuffledColors[i]];
    }
    attempts++;
  } while (
    attempts < 100 &&
    shuffledColors.every((c, i) => c === revealedColors[i])
  );

  // Reconstruct vial with hidden segments in place
  const shuffled: Vial = [...vial];
  for (let i = 0; i < revealedIndices.length; i++) {
    shuffled[revealedIndices[i]] = shuffledColors[i];
  }

  const newVials: Vial[] = state.vials.map((v, i) =>
    i === vialIndex ? shuffled : v
  );

  return revealTopSegments({
    ...state,
    vials: newVials,
    selectedVial: null,
  });
}

/** Adds an empty vial to the game. Returns new state. */
export function addEmptyVial(state: GameState): GameState {
  return {
    ...state,
    vials: [...state.vials, []],
    hidden: [...state.hidden, []],
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
      if (!canPour(source, state.vials[j])) continue;

      const dest = state.vials[j];
      const topColor = getTopColor(source)!;
      const topCount = getTopCount(source);
      const wouldEmptySource = topCount === source.length;

      // Skip only if source is all one color, the move wouldn't empty
      // the source vial, and wouldn't complete the destination
      if (source.every((c) => c === topColor) && !wouldEmptySource) {
        if (dest.length === 0) continue; // moving to empty without freeing source
        if (dest.length + topCount < VIAL_CAPACITY) continue; // won't complete dest
      }

      return true;
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
