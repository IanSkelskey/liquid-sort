import { getTopCount } from '../rules';
import type { Vial, VialModifier } from '../types';
import type { ModifierCounts } from './types';
import { isUniformOrEmpty, pickWeightedCandidate } from './utils';

type ModifierCandidate = {
  index: number;
  weight: number;
};

function buildInOnlyCandidates(vials: Vial[], usedIndices: Set<number>): ModifierCandidate[] {
  return vials
    .map((vial, index) => ({ vial, index }))
    .filter(({ vial, index }) => vial.length === 0 && !usedIndices.has(index))
    .map(({ index }) => ({
      index,
      weight: index + 1,
    }));
}

function buildOutOnlyCandidates(vials: Vial[], usedIndices: Set<number>): ModifierCandidate[] {
  return vials
    .map((vial, index) => ({ vial, index }))
    .filter(({ vial, index }) => vial.length > 0 && !isUniformOrEmpty(vial) && !usedIndices.has(index))
    .map(({ vial, index }) => {
      const topRun = getTopCount(vial);
      const distinctColors = new Set(vial).size;

      return {
        index,
        weight: 10 + distinctColors * 5 + (vial.length - topRun) * 3 + topRun,
      };
    });
}

export function createVialModifiers(
  vials: Vial[],
  modifierCounts: ModifierCounts,
  rng: () => number
): VialModifier[] {
  const vialModifiers = Array<VialModifier>(vials.length).fill('none');
  const usedIndices = new Set<number>();

  for (let count = 0; count < modifierCounts.inOnly; count += 1) {
    const candidates = buildInOnlyCandidates(vials, usedIndices);

    if (candidates.length === 0) {
      break;
    }

    const selected = pickWeightedCandidate(candidates, rng);
    vialModifiers[selected.index] = 'in-only';
    usedIndices.add(selected.index);
  }

  for (let count = 0; count < modifierCounts.outOnly; count += 1) {
    const candidates = buildOutOnlyCandidates(vials, usedIndices);

    if (candidates.length === 0) {
      break;
    }

    const selected = pickWeightedCandidate(candidates, rng);
    vialModifiers[selected.index] = 'out-only';
    usedIndices.add(selected.index);
  }

  return vialModifiers;
}
