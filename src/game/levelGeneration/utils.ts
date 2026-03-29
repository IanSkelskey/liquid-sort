import type { Color, GameState, Vial } from '../types';
import { VIAL_CAPACITY } from '../types';

export function createRng(seed: number) {
  let state = seed | 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function cloneVials(vials: Vial[]): Vial[] {
  return vials.map((vial) => [...vial]);
}

export function cloneHidden(hidden: boolean[][]): boolean[][] {
  return hidden.map((vialHidden) => [...vialHidden]);
}

export function countNonEmptyVials(vials: Vial[]): number {
  return vials.filter((vial) => vial.length > 0).length;
}

export function buildSolvedVials(colors: Color[], numEmpty: number): Vial[] {
  const solvedVials = colors.map((color) => Array<Color>(VIAL_CAPACITY).fill(color));
  const emptyVials = Array.from({ length: numEmpty }, () => [] as Vial);

  return [...solvedVials, ...emptyVials];
}

export function isUniformOrEmpty(vial: Vial): boolean {
  return vial.length === 0 || vial.every((color) => color === vial[0]);
}

export function countMixedVials(vials: Vial[]): number {
  return vials.filter((vial) => vial.length > 0 && !isUniformOrEmpty(vial)).length;
}

export function countCompleteVials(vials: Vial[]): number {
  return vials.filter(
    (vial) =>
      vial.length === VIAL_CAPACITY &&
      vial.every((color) => color === vial[0])
  ).length;
}

export function countColorBoundaries(vials: Vial[]): number {
  let count = 0;

  for (const vial of vials) {
    for (let index = 1; index < vial.length; index += 1) {
      if (vial[index] !== vial[index - 1]) {
        count += 1;
      }
    }
  }

  return count;
}

export function countDistinctColorSpread(vials: Vial[]): number {
  return vials.reduce((total, vial) => total + new Set(vial).size, 0);
}

export function countInterestingHiddenSegments(vials: Vial[], hidden: boolean[][]): number {
  let count = 0;

  for (let vialIndex = 0; vialIndex < vials.length; vialIndex += 1) {
    const vial = vials[vialIndex];
    const vialHidden = hidden[vialIndex] ?? [];

    for (let index = 0; index < vialHidden.length; index += 1) {
      if (vialHidden[index] && index < vial.length - 1 && vial[index] !== vial[index + 1]) {
        count += 1;
      }
    }
  }

  return count;
}

export function countBoringHiddenSegments(vials: Vial[], hidden: boolean[][]): number {
  let count = 0;

  for (let vialIndex = 0; vialIndex < vials.length; vialIndex += 1) {
    const vial = vials[vialIndex];
    const vialHidden = hidden[vialIndex] ?? [];

    for (let index = 0; index < vialHidden.length; index += 1) {
      if (vialHidden[index] && index < vial.length - 1 && vial[index] === vial[index + 1]) {
        count += 1;
      }
    }
  }

  return count;
}

export function isSolvedLayout(vials: Vial[]): boolean {
  return vials.every(
    (vial) =>
      vial.length === 0 ||
      (vial.length === VIAL_CAPACITY && vial.every((color) => color === vial[0]))
  );
}

export function pickWeightedCandidate<T extends { weight: number }>(
  candidates: T[],
  rng: () => number
): T {
  const totalWeight = candidates.reduce((total, candidate) => total + candidate.weight, 0);
  let remaining = rng() * totalWeight;

  for (const candidate of candidates) {
    remaining -= candidate.weight;

    if (remaining <= 0) {
      return candidate;
    }
  }

  return candidates[candidates.length - 1];
}

export function normalizeVials(vials: Vial[]): Vial[] {
  const filledVials = vials.filter((vial) => vial.length > 0);
  const emptyVials = vials.filter((vial) => vial.length === 0);

  return [...filledVials, ...emptyVials];
}

export function hasTargetSilhouette(vials: Vial[], numColors: number, numEmpty: number): boolean {
  const fullCount = vials.filter((vial) => vial.length === VIAL_CAPACITY).length;
  const emptyCount = vials.filter((vial) => vial.length === 0).length;

  return fullCount === numColors && emptyCount === numEmpty;
}

export function getStateKey(state: Pick<GameState, 'vials' | 'hidden'>): string {
  return state.vials
    .map((vial, index) => {
      const hidden = state.hidden[index] ?? [];
      return `${vial.join(',')}:${hidden.map((isHidden) => (isHidden ? '1' : '0')).join('')}`;
    })
    .join('|');
}

export function getVialLayoutKey(vials: Vial[]): string {
  return vials.map((vial) => vial.join(',')).join('|');
}
