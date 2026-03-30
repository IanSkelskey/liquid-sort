import type { Vial, VialModifier } from '../types';

export type ModifierCounts = {
  inOnly: number;
  outOnly: number;
};

export type LevelConfig = {
  numColors: number;
  numEmpty: number;
  reverseSteps: number;
  generationAttempts: number;
  modifierCounts: ModifierCounts;
};

export type DifficultyTargets = {
  moveTarget: number;
  searchDepth: number;
  searchBranchLimit: number;
  deadEndBonus: number;
  minMixedVials: number;
  maxCompleteVials: number;
  rolloutCount: number;
  deadEndRateTarget: number;
  deadEndRateBonus: number;
  preferredRandomWinRate: number;
  randomWinFloor: number;
  randomWinCap: number;
  trapMoveRateTarget: number;
  requireDeadEndRate: boolean;
};

export type ReverseMoveCandidate = {
  fromIndex: number;
  toIndex: number;
  count: number;
  weight: number;
};

export type LevelDefinition = {
  vials: Vial[];
  hidden: boolean[][];
  vialModifiers: VialModifier[];
  score: number;
  deadEndReachable: boolean;
};

export type PolicyRunStats = {
  deadEndRate: number;
  nonWinRate: number;
  winRate: number;
};

export type MindlessRunResult = {
  won: boolean;
  deadEnd: boolean;
};

export type MindlessRunPolicy = 'first' | 'random' | 'risky';

export type MindlessRunStats = {
  random: PolicyRunStats;
  risky: PolicyRunStats;
  first: MindlessRunResult;
  trapMoveRate: number;
  forcedAutopilotSteps: number;
};

export type LevelCandidate = LevelDefinition & {
  appliedReverseSteps: number;
  mindlessStats?: MindlessRunStats;
};
