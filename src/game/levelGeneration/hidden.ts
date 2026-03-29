import type { Vial } from '../types';
import { isUniformOrEmpty, pickWeightedCandidate } from './utils';

export function generateHidden(level: number, vials: Vial[], rng: () => number): boolean[][] {
  if (level < 11) {
    return vials.map(() => []);
  }

  const chance = Math.min(0.22 + (level - 11) * 0.012, 0.65);

  return vials.map((vial) => {
    if (vial.length === 0 || isUniformOrEmpty(vial)) {
      return [];
    }

    const hidden = Array<boolean>(vial.length).fill(false);
    const candidates: Array<{ index: number; weight: number }> = [];

    for (let index = 0; index < vial.length - 1; index += 1) {
      let weight = 1;

      if (vial[index] !== vial[index + 1]) {
        weight += 7;
      }

      if (index === vial.length - 2) {
        weight += 3;
      }

      if (index < vial.length - 2 && vial[index] !== vial[index + 2]) {
        weight += 2;
      }

      candidates.push({ index, weight });
    }

    const rawTargetCount = (vial.length - 1) * chance;
    let targetCount = Math.floor(rawTargetCount);

    if (rng() < rawTargetCount - targetCount) {
      targetCount += 1;
    }

    if (targetCount === 0 && level >= 20 && rng() < 0.4) {
      targetCount = 1;
    }

    const remainingCandidates = [...candidates];

    while (targetCount > 0 && remainingCandidates.length > 0) {
      const choice = pickWeightedCandidate(remainingCandidates, rng);
      hidden[choice.index] = true;
      targetCount -= 1;

      const choiceIndex = remainingCandidates.findIndex(
        (candidate) => candidate.index === choice.index
      );

      remainingCandidates.splice(choiceIndex, 1);
    }

    return hidden;
  });
}
