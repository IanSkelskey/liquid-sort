import { useMemo } from 'react';
import { analyzeMoveAvailability, type MoveAnalysis, type MoveDebugEntry } from '../game/engine';
import type { GameState } from '../game/types';

export interface MoveDebugData {
  moveAnalysis: MoveAnalysis;
  movesRemaining: number;
  validMovePreview: MoveDebugEntry[];
  skipSummary: Array<[string, number]>;
  totalCandidates: number;
}

export function useMoveDebug(state: GameState): MoveDebugData {
  const moveAnalysis = useMemo(() => analyzeMoveAvailability(state), [state]);
  const movesRemaining = moveAnalysis.validMoves.length;
  const validMovePreview = useMemo(
    () => moveAnalysis.validMoves.slice(0, 12),
    [moveAnalysis.validMoves]
  );
  const skipSummary = useMemo(
    () =>
      Object.entries(moveAnalysis.skipCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]),
    [moveAnalysis.skipCounts]
  );

  return {
    moveAnalysis,
    movesRemaining,
    validMovePreview,
    skipSummary,
    totalCandidates: moveAnalysis.validMoves.length + moveAnalysis.skippedMoves.length,
  };
}
