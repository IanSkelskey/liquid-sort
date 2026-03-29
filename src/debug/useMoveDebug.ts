import { useMemo } from 'react';
import { analyzeMoveAvailability, hasMovesLeft, type MoveAnalysis, type MoveDebugEntry } from '../game/engine';
import type { GameState } from '../game/types';

export interface MoveDebugData {
  moveAnalysis: MoveAnalysis;
  movesRemaining: number;
  validMovePreview: MoveDebugEntry[];
  skipSummary: Array<[string, number]>;
  totalCandidates: number;
}

export function useMoveDebug(state: GameState): MoveDebugData {
  const moveAnalysis = useMemo<MoveAnalysis>(() => {
    if (!import.meta.env.DEV) {
      return {
        hasMovesLeft: hasMovesLeft(state),
        validMoves: [],
        skippedMoves: [],
        skipCounts: {
          'source-empty': 0,
          'source-complete-revealed': 0,
          'same-vial': 0,
          'cannot-pour': 0,
          'no-revealed-top': 0,
          'superficial-empty-transfer': 0,
          'superficial-non-completing': 0,
          'superficial-loop': 0,
        },
      };
    }

    return analyzeMoveAvailability(state);
  }, [state]);
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
