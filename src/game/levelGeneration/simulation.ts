import { analyzeMoveAvailability, pour, type MoveDebugEntry } from '../engine';
import { getTopCount, revealTopSegments } from '../rules';
import { type GameState, type Vial, type VialModifier, VIAL_CAPACITY } from '../types';
import { getDifficultyTargets } from './config';
import type {
  MindlessRunPolicy,
  MindlessRunResult,
  MindlessRunStats,
  PolicyRunStats,
  ReverseMoveCandidate,
} from './types';
import {
  cloneHidden,
  cloneVialModifiers,
  cloneVials,
  countNonEmptyVials,
  createRng,
  getStateKey,
  isUniformOrEmpty,
  pickWeightedCandidate,
} from './utils';

type MindlessOption = {
  nextState: GameState;
  weight: number;
};

export function buildReverseMoveCandidates(vials: Vial[]): ReverseMoveCandidate[] {
  const candidates: ReverseMoveCandidate[] = [];

  for (let fromIndex = 0; fromIndex < vials.length; fromIndex += 1) {
    const from = vials[fromIndex];

    if (from.length === 0) {
      continue;
    }

    const topCount = getTopCount(from);

    for (let toIndex = 0; toIndex < vials.length; toIndex += 1) {
      const to = vials[toIndex];

      if (toIndex === fromIndex || to.length >= VIAL_CAPACITY) {
        continue;
      }

      const maxCount = Math.min(topCount, VIAL_CAPACITY - to.length);

      for (let count = 1; count <= maxCount; count += 1) {
        let weight = 1;

        if (count === 1) {
          weight += 6;
        }

        if (to.length > 0) {
          weight += 4;
        }

        if (!isUniformOrEmpty(from)) {
          weight += 3;
        }

        if (!isUniformOrEmpty(to)) {
          weight += 2;
        }

        if (from.length === VIAL_CAPACITY) {
          weight += 1;
        }

        candidates.push({
          fromIndex,
          toIndex,
          count,
          weight,
        });
      }
    }
  }

  return candidates;
}

export function applyReverseMove(vials: Vial[], candidate: ReverseMoveCandidate): Vial[] {
  const nextVials = cloneVials(vials);
  const movedSegments = nextVials[candidate.fromIndex].splice(
    nextVials[candidate.fromIndex].length - candidate.count,
    candidate.count
  );

  nextVials[candidate.toIndex].push(...movedSegments);

  return nextVials;
}

export function createCandidateState(
  level: number,
  vials: Vial[],
  hidden: boolean[][],
  vialModifiers: VialModifier[]
): GameState {
  return revealTopSegments({
    vials: cloneVials(vials),
    hidden: cloneHidden(hidden),
    vialModifiers: cloneVialModifiers(vialModifiers),
    selectedVial: null,
    moveHistory: [],
    level,
    moveCount: 0,
    coins: 0,
    addedVial: false,
    won: false,
  });
}

export function scoreRiskyMove(
  state: GameState,
  nextState: GameState,
  move: MoveDebugEntry
): number {
  const sourceBefore = state.vials[move.from];
  const destBefore = state.vials[move.to];
  const sourceHiddenBefore = state.hidden[move.from] ?? [];
  const sourceHiddenAfter = nextState.hidden[move.from] ?? [];
  const hiddenBeforeCount = sourceHiddenBefore.filter(Boolean).length;
  const hiddenAfterCount = sourceHiddenAfter.filter(Boolean).length;

  let score = 0;

  if (destBefore.length === 0) {
    score += 6;
  }

  if (destBefore.length + (move.moveCount ?? 0) < VIAL_CAPACITY) {
    score += 4;
  }

  if (hiddenAfterCount === hiddenBeforeCount) {
    score += 4;
  } else {
    score -= (hiddenBeforeCount - hiddenAfterCount) * 2;
  }

  if (nextState.vials[move.from].length === 0) {
    score -= 2;
  }

  if (
    nextState.vials[move.to].length === VIAL_CAPACITY &&
    nextState.vials[move.to].every((color) => color === nextState.vials[move.to][0])
  ) {
    score -= 5;
  }

  if (sourceBefore.every((color) => color === sourceBefore[0])) {
    score += 2;
  }

  return score;
}

function buildMindlessOptions(state: GameState, moves: MoveDebugEntry[]): MindlessOption[] {
  return moves
    .map((candidateMove) => {
      const nextState = pour(state, candidateMove.from, candidateMove.to);

      if (!nextState) {
        return null;
      }

      return {
        nextState,
        weight: Math.max(1, 12 + scoreRiskyMove(state, nextState, candidateMove)),
      };
    })
    .filter((entry): entry is MindlessOption => entry !== null);
}

function chooseMindlessOption(
  options: MindlessOption[],
  policy: MindlessRunPolicy,
  rng: () => number
): MindlessOption {
  if (policy === 'first') {
    return options[0];
  }

  if (policy === 'random') {
    return options[Math.floor(rng() * options.length)];
  }

  return pickWeightedCandidate(options, rng);
}

function simulateMindlessRun(
  initialState: GameState,
  policy: MindlessRunPolicy,
  seed: number
): MindlessRunResult {
  const rng = createRng(seed);
  const moveCap = Math.max(24, initialState.vials.length * VIAL_CAPACITY * 4);
  let state = initialState;

  for (let move = 0; move < moveCap; move += 1) {
    if (state.won) {
      return { won: true, deadEnd: false };
    }

    const analysis = analyzeMoveAvailability(state);

    if (!analysis.hasMovesLeft || analysis.validMoves.length === 0) {
      return { won: false, deadEnd: true };
    }

    const options = buildMindlessOptions(state, analysis.validMoves);

    if (options.length === 0) {
      return { won: false, deadEnd: true };
    }

    state = chooseMindlessOption(options, policy, rng).nextState;
  }

  return { won: state.won, deadEnd: !state.won };
}

function collectPolicyRunStats(
  initialState: GameState,
  policy: MindlessRunPolicy,
  rolloutCount: number,
  seedBase: number
): PolicyRunStats {
  let winCount = 0;
  let deadEndCount = 0;

  for (let rollout = 0; rollout < rolloutCount; rollout += 1) {
    const seedOffset = policy === 'first' ? 1 : 271;
    const result = simulateMindlessRun(initialState, policy, seedBase + rollout * seedOffset);

    if (result.won) {
      winCount += 1;
    }

    if (result.deadEnd) {
      deadEndCount += 1;
    }
  }

  return {
    deadEndRate: deadEndCount / rolloutCount,
    winRate: winCount / rolloutCount,
    nonWinRate: (rolloutCount - winCount) / rolloutCount,
  };
}

function countForcedAutopilotSteps(initialState: GameState, maxSteps = 14): number {
  let state = initialState;
  let forcedSteps = 0;

  for (let step = 0; step < maxSteps; step += 1) {
    if (state.won) {
      break;
    }

    const analysis = analyzeMoveAvailability(state);

    if (!analysis.hasMovesLeft || analysis.validMoves.length === 0) {
      break;
    }

    if (step > 0 && analysis.validMoves.length > 1) {
      break;
    }

    if (step > 0 && analysis.validMoves.length === 1) {
      forcedSteps += 1;
    }

    const nextState = pour(state, analysis.validMoves[0].from, analysis.validMoves[0].to);

    if (!nextState) {
      break;
    }

    state = nextState;
  }

  return forcedSteps;
}

function estimateTrapMoveRate(initialState: GameState, seedBase: number): number {
  const analysis = analyzeMoveAvailability(initialState);

  if (!analysis.hasMovesLeft || analysis.validMoves.length === 0) {
    return 0;
  }

  let trapCount = 0;

  for (let moveIndex = 0; moveIndex < analysis.validMoves.length; moveIndex += 1) {
    const move = analysis.validMoves[moveIndex];
    const nextState = pour(initialState, move.from, move.to);

    if (!nextState) {
      continue;
    }

    const followUp = simulateMindlessRun(nextState, 'first', seedBase + moveIndex * 101);

    if (followUp.deadEnd || !followUp.won) {
      trapCount += 1;
    }
  }

  return trapCount / analysis.validMoves.length;
}

export function estimateMindlessRunStats(
  level: number,
  vials: Vial[],
  hidden: boolean[][],
  vialModifiers: VialModifier[]
): MindlessRunStats {
  const targets = getDifficultyTargets(level, countNonEmptyVials(vials));
  const initialState = createCandidateState(level, vials, hidden, vialModifiers);
  const random = collectPolicyRunStats(
    initialState,
    'random',
    targets.rolloutCount,
    level * 1543 + 17
  );
  const risky = collectPolicyRunStats(
    initialState,
    'risky',
    Math.max(4, Math.ceil(targets.rolloutCount * 0.75)),
    level * 2339 + 29
  );
  const first = simulateMindlessRun(initialState, 'first', level * 3253 + 41);

  return {
    random,
    risky,
    first,
    trapMoveRate: estimateTrapMoveRate(initialState, level * 4523 + 59),
    forcedAutopilotSteps: countForcedAutopilotSteps(initialState),
  };
}

export function hasReachableDeadEnd(level: number, initialState: GameState): boolean {
  const { searchDepth, searchBranchLimit } = getDifficultyTargets(
    level,
    countNonEmptyVials(initialState.vials)
  );
  const visitedDepth = new Map<string, number>();

  function search(state: GameState, depthRemaining: number): boolean {
    if (state.won) {
      return false;
    }

    const analysis = analyzeMoveAvailability(state);

    if (!analysis.hasMovesLeft) {
      return true;
    }

    if (depthRemaining === 0) {
      return false;
    }

    const key = getStateKey(state);
    const previousDepth = visitedDepth.get(key);

    if (previousDepth !== undefined && previousDepth >= depthRemaining) {
      return false;
    }

    visitedDepth.set(key, depthRemaining);

    const nextStates = analysis.validMoves
      .map((move) => {
        const nextState = pour(state, move.from, move.to);

        if (!nextState) {
          return null;
        }

        return {
          nextState,
          riskScore: scoreRiskyMove(state, nextState, move),
        };
      })
      .filter((entry): entry is { nextState: GameState; riskScore: number } => entry !== null)
      .sort((left, right) => right.riskScore - left.riskScore)
      .slice(0, searchBranchLimit);

    for (const { nextState } of nextStates) {
      if (search(nextState, depthRemaining - 1)) {
        return true;
      }
    }

    return false;
  }

  return search(initialState, searchDepth);
}
