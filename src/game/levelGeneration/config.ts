import type { DifficultyTargets, LevelConfig } from './types';

export function getLevelConfig(level: number): LevelConfig {
  if (level <= 5) {
    return {
      numColors: 3,
      numEmpty: 2,
      reverseSteps: 90,
      generationAttempts: 10,
      modifierCounts: { inOnly: 0, outOnly: 0 },
    };
  }

  if (level <= 15) {
    return {
      numColors: 5,
      numEmpty: 2,
      reverseSteps: 220,
      generationAttempts: 12,
      modifierCounts: { inOnly: 1, outOnly: 0 },
    };
  }

  if (level <= 25) {
    return {
      numColors: 7,
      numEmpty: 2,
      reverseSteps: 500,
      generationAttempts: 14,
      modifierCounts: { inOnly: 1, outOnly: 1 },
    };
  }

  if (level <= 40) {
    return {
      numColors: 9,
      numEmpty: 2,
      reverseSteps: 600,
      generationAttempts: 16,
      modifierCounts: { inOnly: 1, outOnly: 1 },
    };
  }

  return {
    numColors: 10,
    numEmpty: 2,
    reverseSteps: 900,
    generationAttempts: 18,
    modifierCounts: { inOnly: 1, outOnly: 2 },
  };
}

export function getDifficultyTargets(level: number, numColors: number): DifficultyTargets {
  if (level <= 5) {
    return {
      moveTarget: 5,
      searchDepth: 4,
      searchBranchLimit: 3,
      deadEndBonus: 35,
      minMixedVials: Math.max(2, Math.ceil(numColors * 0.7)),
      maxCompleteVials: 1,
      rolloutCount: 6,
      deadEndRateTarget: 0.1,
      deadEndRateBonus: 40,
      preferredRandomWinRate: 0.9,
      randomWinFloor: 0.55,
      randomWinCap: 1,
      trapMoveRateTarget: 0,
      requireDeadEndRate: false,
    };
  }

  if (level <= 15) {
    return {
      moveTarget: 4,
      searchDepth: 5,
      searchBranchLimit: 4,
      deadEndBonus: 70,
      minMixedVials: Math.max(3, Math.ceil(numColors * 0.8)),
      maxCompleteVials: 0,
      rolloutCount: 10,
      deadEndRateTarget: 0.2,
      deadEndRateBonus: 70,
      preferredRandomWinRate: 0.75,
      randomWinFloor: 0.4,
      randomWinCap: 0.9,
      trapMoveRateTarget: 0.05,
      requireDeadEndRate: false,
    };
  }

  if (level <= 25) {
    return {
      moveTarget: 2,
      searchDepth: 6,
      searchBranchLimit: 4,
      deadEndBonus: 120,
      minMixedVials: Math.max(5, Math.ceil(numColors * 0.86)),
      maxCompleteVials: 0,
      rolloutCount: 16,
      deadEndRateTarget: 0.35,
      deadEndRateBonus: 120,
      preferredRandomWinRate: 0.35,
      randomWinFloor: 0.15,
      randomWinCap: 0.65,
      trapMoveRateTarget: 0.15,
      requireDeadEndRate: true,
    };
  }

  if (level <= 40) {
    return {
      moveTarget: 2,
      searchDepth: 7,
      searchBranchLimit: 4,
      deadEndBonus: 165,
      minMixedVials: Math.max(7, Math.ceil(numColors * 0.9)),
      maxCompleteVials: 0,
      rolloutCount: 24,
      deadEndRateTarget: 0.5,
      deadEndRateBonus: 180,
      preferredRandomWinRate: 0.2,
      randomWinFloor: 0.08,
      randomWinCap: 0.45,
      trapMoveRateTarget: 0.25,
      requireDeadEndRate: true,
    };
  }

  return {
    moveTarget: 1,
    searchDepth: 8,
    searchBranchLimit: 5,
    deadEndBonus: 220,
    minMixedVials: Math.max(8, Math.ceil(numColors * 0.92)),
    maxCompleteVials: 0,
    rolloutCount: 28,
    deadEndRateTarget: 0.65,
    deadEndRateBonus: 240,
    preferredRandomWinRate: 0.1,
    randomWinFloor: 0.03,
    randomWinCap: 0.3,
    trapMoveRateTarget: 0.35,
    requireDeadEndRate: true,
  };
}
