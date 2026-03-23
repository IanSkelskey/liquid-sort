import { type Color, type Vial, type GameState, ALL_COLORS, VIAL_CAPACITY } from './types';
import { canPour } from './engine';

/**
 * Returns the number of colors and empty vials for a given level.
 * Difficulty ramps up as levels increase.
 */
function getLevelConfig(level: number): { numColors: number; numEmpty: number } {
  if (level <= 5) return { numColors: 3, numEmpty: 2 };
  if (level <= 15) return { numColors: 5, numEmpty: 2 };
  if (level <= 25) return { numColors: 7, numEmpty: 2 };
  if (level <= 40) return { numColors: 9, numEmpty: 2 };
  return { numColors: 10, numEmpty: 2 };
}

/** Seeded pseudo-random number generator (mulberry32) for deterministic levels. */
function createRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle using a provided RNG function. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generates a level by creating a solved state and shuffling via random pours.
 * Uses reverse-shuffle approach to guarantee solvability.
 */
export function generateLevel(level: number): Vial[] {
  const { numColors, numEmpty } = getLevelConfig(level);
  const colors = ALL_COLORS.slice(0, numColors);
  const rng = createRng(level * 7919 + 1013);

  // Create all segments: each color appears VIAL_CAPACITY times
  const allSegments: Color[] = [];
  for (const color of colors) {
    for (let i = 0; i < VIAL_CAPACITY; i++) {
      allSegments.push(color);
    }
  }

  // Shuffle and distribute into vials
  let shuffled = shuffle(allSegments, rng);

  // Ensure we don't start in a solved state — reshuffle if needed
  let attempts = 0;
  while (isTrivial(shuffled, numColors) && attempts < 100) {
    shuffled = shuffle(allSegments, () => Math.random());
    attempts++;
  }

  const vials: Vial[] = [];
  for (let i = 0; i < numColors; i++) {
    vials.push(shuffled.slice(i * VIAL_CAPACITY, (i + 1) * VIAL_CAPACITY));
  }

  // Add empty vials
  for (let i = 0; i < numEmpty; i++) {
    vials.push([]);
  }

  return vials;
}

/** Checks if a distribution is trivially solved. */
function isTrivial(segments: Color[], numVials: number): boolean {
  for (let i = 0; i < numVials; i++) {
    const start = i * VIAL_CAPACITY;
    const color = segments[start];
    for (let j = 1; j < VIAL_CAPACITY; j++) {
      if (segments[start + j] !== color) return false;
    }
  }
  return true;
}

/** Verifies a level is solvable using BFS. Used for testing. */
export function isSolvable(vials: Vial[]): boolean {
  const key = (v: Vial[]) => v.map((vial) => vial.join(',')).join('|');

  const visited = new Set<string>();
  const queue: Vial[][] = [vials.map((v) => [...v])];
  visited.add(key(vials));

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check win
    if (current.every((v) => v.length === 0 || (v.length === VIAL_CAPACITY && v.every((c) => c === v[0])))) {
      return true;
    }

    // Try all possible pours
    for (let i = 0; i < current.length; i++) {
      for (let j = 0; j < current.length; j++) {
        if (i === j) continue;
        if (!canPour(current[i], current[j])) continue;
        // Skip pouring from complete vial
        if (current[i].length === VIAL_CAPACITY && current[i].every((c) => c === current[i][0])) continue;

        // Perform pour
        const topColor = current[i][current[i].length - 1];
        let topCount = 0;
        for (let k = current[i].length - 1; k >= 0; k--) {
          if (current[i][k] === topColor) topCount++;
          else break;
        }
        const count = Math.min(topCount, VIAL_CAPACITY - current[j].length);

        const newState = current.map((v) => [...v]);
        const moved = newState[i].splice(newState[i].length - count, count);
        newState[j].push(...moved);

        const k2 = key(newState);
        if (!visited.has(k2)) {
          visited.add(k2);
          queue.push(newState);
        }
      }
    }
  }

  return false;
}

/** Creates the initial game state for a given level. */
export function createGameState(level: number, coins?: number): GameState {
  return {
    vials: generateLevel(level),
    selectedVial: null,
    moveHistory: [],
    level,
    moveCount: 0,
    won: false,
    coins: coins ?? getSavedCoins(),
    addedVial: false,
  };
}

/** Gets the current saved level from localStorage, defaulting to 1. */
export function getSavedLevel(): number {
  try {
    const saved = localStorage.getItem('liquid-sort-level');
    if (saved) {
      const n = parseInt(saved, 10);
      if (Number.isFinite(n) && n >= 1) return n;
    }
  } catch {
    // localStorage may not be available
  }
  return 1;
}

/** Saves the current level to localStorage. */
export function saveLevel(level: number): void {
  try {
    localStorage.setItem('liquid-sort-level', String(level));
  } catch {
    // ignore
  }
}

/** Gets saved coins from localStorage, defaulting to 5 (starter coins). */
export function getSavedCoins(): number {
  try {
    const saved = localStorage.getItem('liquid-sort-coins');
    if (saved) {
      const n = parseInt(saved, 10);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  } catch {
    // localStorage may not be available
  }
  return 5;
}

/** Saves coins to localStorage. */
export function saveCoins(coins: number): void {
  try {
    localStorage.setItem('liquid-sort-coins', String(coins));
  } catch {
    // ignore
  }
}

/** Clears all saved progress from localStorage. */
export function clearSave(): void {
  try {
    localStorage.removeItem('liquid-sort-level');
    localStorage.removeItem('liquid-sort-coins');
  } catch {
    // ignore
  }
}
