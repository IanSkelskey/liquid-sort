import { analyzeMoveAvailability } from '../engine';
import { getDifficultyTargets } from './config';
import { createCandidateState } from './simulation';
import type { LevelDefinition } from './types';
import {
  countBoringHiddenSegments,
  countColorBoundaries,
  countCompleteVials,
  countDistinctColorSpread,
  countInterestingHiddenSegments,
  countMixedVials,
} from './utils';

export function scoreLevelDefinition(
  level: number,
  numColors: number,
  definition: Pick<LevelDefinition, 'vials' | 'hidden' | 'vialModifiers'>,
  appliedReverseSteps: number
): number {
  const targets = getDifficultyTargets(level, numColors);
  const modifierCount = definition.vialModifiers.filter((modifier) => modifier !== 'none').length;
  const state = createCandidateState(
    level,
    definition.vials,
    definition.hidden,
    definition.vialModifiers
  );
  const moveAnalysis = analyzeMoveAvailability(state);
  const mixedVials = countMixedVials(definition.vials);
  const completeVials = countCompleteVials(definition.vials);
  const colorBoundaries = countColorBoundaries(definition.vials);
  const distinctColorSpread = countDistinctColorSpread(definition.vials);
  const interestingHiddenSegments = countInterestingHiddenSegments(
    definition.vials,
    definition.hidden
  );
  const boringHiddenSegments = countBoringHiddenSegments(definition.vials, definition.hidden);
  const visibleTopColors = state.vials
    .filter((vial) => vial.length > 0)
    .map((vial) => vial[vial.length - 1]);
  const topColorCollisions = visibleTopColors.length - new Set(visibleTopColors).size;
  const minimumOpeningMoves = level > 25 ? 1 : 2;

  let score = 0;

  score += appliedReverseSteps * 2;
  score += mixedVials * 18;
  score += colorBoundaries * 8;
  score += distinctColorSpread * 3;
  score += interestingHiddenSegments * 10;
  score += topColorCollisions * 20;
  score += modifierCount * 18;
  score -= boringHiddenSegments * 7;
  score -= Math.abs(moveAnalysis.validMoves.length - targets.moveTarget) * 6;
  score -= Math.max(0, targets.minMixedVials - mixedVials) * 25;
  score -= Math.max(0, completeVials - targets.maxCompleteVials) * 30;

  if (moveAnalysis.validMoves.length < minimumOpeningMoves) {
    score -= 40;
  }

  if (!moveAnalysis.hasMovesLeft) {
    score -= 200;
  }

  return score;
}
