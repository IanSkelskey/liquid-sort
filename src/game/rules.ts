import { canUseVialAsSource, canUseVialAsTarget } from './modifiers';
import { type Color, type GameState, type Vial, type VialModifier, VIAL_CAPACITY } from './types';

export function revealTopSegments(state: GameState): GameState {
  let changed = false;

  const hidden = state.hidden.map((vialHidden, vialIndex) => {
    const vial = state.vials[vialIndex];

    if (vial.length === 0) {
      return vialHidden;
    }

    const topIndex = vial.length - 1;

    if (topIndex < vialHidden.length && vialHidden[topIndex]) {
      changed = true;
      const nextHidden = [...vialHidden];
      nextHidden[topIndex] = false;
      return nextHidden;
    }

    return vialHidden;
  });

  return changed ? { ...state, hidden } : state;
}

export function getTopColor(vial: Vial): Color | undefined {
  return vial.length > 0 ? vial[vial.length - 1] : undefined;
}

export function getTopCount(vial: Vial): number {
  if (vial.length === 0) {
    return 0;
  }

  const topColor = vial[vial.length - 1];
  let count = 0;

  for (let index = vial.length - 1; index >= 0; index -= 1) {
    if (vial[index] !== topColor) {
      break;
    }

    count += 1;
  }

  return count;
}

export function getTopRevealedCount(vial: Vial, hidden: boolean[] = []): number {
  if (vial.length === 0) {
    return 0;
  }

  const topColor = vial[vial.length - 1];
  let count = 0;

  for (let index = vial.length - 1; index >= 0; index -= 1) {
    if (hidden[index] || vial[index] !== topColor) {
      break;
    }

    count += 1;
  }

  return count;
}

export function isVialUniform(vial: Vial): boolean {
  return vial.length > 0 && vial.every((color) => color === vial[0]);
}

export function isVialComplete(vial: Vial): boolean {
  return vial.length === VIAL_CAPACITY && isVialUniform(vial);
}

export function isCompletedVisibleVial(vial: Vial, hidden: boolean[] = []): boolean {
  return isVialComplete(vial) && !hidden.some(Boolean);
}

export function canPour(
  source: Vial,
  dest: Vial,
  sourceModifier: VialModifier = 'none',
  destModifier: VialModifier = 'none'
): boolean {
  if (
    source.length === 0 ||
    dest.length >= VIAL_CAPACITY ||
    !canUseVialAsSource(sourceModifier) ||
    !canUseVialAsTarget(destModifier)
  ) {
    return false;
  }

  if (dest.length === 0) {
    return true;
  }

  return getTopColor(source) === getTopColor(dest);
}

export function isBoardWon(state: Pick<GameState, 'vials' | 'hidden'>): boolean {
  return state.vials.every((vial, index) => {
    if (vial.length === 0) {
      return true;
    }

    return isCompletedVisibleVial(vial, state.hidden[index] ?? []);
  });
}

export function areVialsEqual(left: Vial[], right: Vial[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let vialIndex = 0; vialIndex < left.length; vialIndex += 1) {
    if (left[vialIndex].length !== right[vialIndex].length) {
      return false;
    }

    for (let colorIndex = 0; colorIndex < left[vialIndex].length; colorIndex += 1) {
      if (left[vialIndex][colorIndex] !== right[vialIndex][colorIndex]) {
        return false;
      }
    }
  }

  return true;
}

export function areHiddenEqual(left: boolean[][], right: boolean[][]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let vialIndex = 0; vialIndex < left.length; vialIndex += 1) {
    if (left[vialIndex].length !== right[vialIndex].length) {
      return false;
    }

    for (let hiddenIndex = 0; hiddenIndex < left[vialIndex].length; hiddenIndex += 1) {
      if (left[vialIndex][hiddenIndex] !== right[vialIndex][hiddenIndex]) {
        return false;
      }
    }
  }

  return true;
}

export function countHiddenSegments(hidden: boolean[][]): number {
  let count = 0;

  for (const vialHidden of hidden) {
    for (const segmentHidden of vialHidden) {
      if (segmentHidden) {
        count += 1;
      }
    }
  }

  return count;
}
