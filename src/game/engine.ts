import { canUseVialAsSource, canUseVialAsTarget, getVialModifier } from './modifiers';
import { type Color, type GameState, VIAL_CAPACITY } from './types';
import {
  areHiddenEqual,
  areVialsEqual,
  canPour,
  countHiddenSegments,
  getTopColor,
  getTopRevealedCount,
  isBoardWon,
  isCompletedVisibleVial,
  isVialComplete,
  revealTopSegments,
} from './rules';

export type MoveSkipReason =
  | 'source-empty'
  | 'source-blocked-by-modifier'
  | 'source-complete-revealed'
  | 'same-vial'
  | 'target-blocked-by-modifier'
  | 'cannot-pour'
  | 'no-revealed-top'
  | 'superficial-empty-transfer'
  | 'superficial-non-completing'
  | 'superficial-loop';

export interface MoveDebugEntry {
  from: number;
  to: number;
  reason: 'valid' | MoveSkipReason;
  moveCount?: number;
  sourceLength: number;
  destLength: number;
  sourceHiddenCount: number;
}

export interface MoveAnalysis {
  hasMovesLeft: boolean;
  validMoves: MoveDebugEntry[];
  skippedMoves: MoveDebugEntry[];
  skipCounts: Record<MoveSkipReason, number>;
}

function createMoveAnalysisState(
  vials: GameState['vials'],
  hidden: GameState['hidden'],
  vialModifiers: GameState['vialModifiers']
): GameState {
  return {
    vials,
    hidden,
    vialModifiers,
    selectedVial: null,
    moveHistory: [],
    level: 0,
    moveCount: 0,
    coins: 0,
    addedVial: false,
    won: false,
  };
}

function isReversibleSuperficialMove(state: GameState, from: number, to: number): boolean {
  const forwardState = pour(state, from, to);

  if (!forwardState) {
    return false;
  }

  if (countHiddenSegments(forwardState.hidden) < countHiddenSegments(state.hidden)) {
    return false;
  }

  const backwardState = pour(forwardState, to, from);

  if (!backwardState) {
    return false;
  }

  return (
    areVialsEqual(state.vials, backwardState.vials) &&
    areHiddenEqual(state.hidden, backwardState.hidden)
  );
}

export function pour(state: GameState, fromIndex: number, toIndex: number): GameState | null {
  const source = state.vials[fromIndex];
  const dest = state.vials[toIndex];
  const sourceModifier = getVialModifier(state.vialModifiers, fromIndex);
  const destModifier = getVialModifier(state.vialModifiers, toIndex);

  if (fromIndex === toIndex || !canPour(source, dest, sourceModifier, destModifier)) {
    return null;
  }

  const sourceHidden = state.hidden[fromIndex] ?? [];

  if (isCompletedVisibleVial(source, sourceHidden)) {
    return null;
  }

  const topColor = getTopColor(source);
  const topCount = getTopRevealedCount(source, sourceHidden);

  if (!topColor || topCount === 0) {
    return null;
  }

  const count = Math.min(topCount, VIAL_CAPACITY - dest.length);
  const nextSource = source.slice(0, source.length - count);
  const nextDest = [...dest, ...Array<Color>(count).fill(topColor)];

  const nextState: GameState = {
    ...state,
    vials: state.vials.map((vial, vialIndex) => {
      if (vialIndex === fromIndex) {
        return nextSource;
      }

      if (vialIndex === toIndex) {
        return nextDest;
      }

      return vial;
    }),
    hidden: state.hidden.map((vialHidden, vialIndex) => {
      if (vialIndex === fromIndex) {
        return vialHidden.slice(0, nextSource.length);
      }

      if (vialIndex === toIndex) {
        return [...vialHidden, ...Array<boolean>(count).fill(false)];
      }

      return vialHidden;
    }),
    vialModifiers: state.vialModifiers,
    selectedVial: null,
    moveHistory: [...state.moveHistory, { from: fromIndex, to: toIndex, count }],
    moveCount: state.moveCount + 1,
  };

  const revealedState = revealTopSegments(nextState);

  return {
    ...revealedState,
    won: checkWin(revealedState),
  };
}

export function checkWin(state: GameState): boolean {
  return isBoardWon(state);
}

export function undo(state: GameState): GameState | null {
  if (state.moveHistory.length === 0) {
    return null;
  }

  const lastMove = state.moveHistory[state.moveHistory.length - 1];
  const source = state.vials[lastMove.to];
  const dest = state.vials[lastMove.from];
  const movedSegments = source.slice(source.length - lastMove.count);
  const nextSource = source.slice(0, source.length - lastMove.count);
  const nextDest = [...dest, ...movedSegments];

  return revealTopSegments({
    ...state,
    vials: state.vials.map((vial, vialIndex) => {
      if (vialIndex === lastMove.to) {
        return nextSource;
      }

      if (vialIndex === lastMove.from) {
        return nextDest;
      }

      return vial;
    }),
    hidden: state.hidden.map((vialHidden, vialIndex) => {
      if (vialIndex === lastMove.to) {
        return vialHidden.slice(0, nextSource.length);
      }

      if (vialIndex === lastMove.from) {
        return [...vialHidden, ...Array<boolean>(lastMove.count).fill(false)];
      }

      return vialHidden;
    }),
    selectedVial: null,
    moveHistory: state.moveHistory.slice(0, -1),
    moveCount: state.moveCount - 1,
    won: false,
  });
}

export function shuffleVial(state: GameState, vialIndex: number): GameState {
  const vial = state.vials[vialIndex];

  if (vial.length <= 1) {
    return state;
  }

  const hidden = state.hidden[vialIndex] ?? [];
  const revealedIndices: number[] = [];
  const revealedColors: Color[] = [];

  for (let index = 0; index < vial.length; index += 1) {
    if (!hidden[index]) {
      revealedIndices.push(index);
      revealedColors.push(vial[index]);
    }
  }

  if (revealedColors.length <= 1) {
    return state;
  }

  let shuffledColors: Color[] = [];
  let attempts = 0;

  do {
    shuffledColors = [...revealedColors];

    for (let index = shuffledColors.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledColors[index], shuffledColors[swapIndex]] = [
        shuffledColors[swapIndex],
        shuffledColors[index],
      ];
    }

    attempts += 1;
  } while (
    attempts < 100 &&
    shuffledColors.every((color, colorIndex) => color === revealedColors[colorIndex])
  );

  const shuffledVial = [...vial];

  for (let index = 0; index < revealedIndices.length; index += 1) {
    shuffledVial[revealedIndices[index]] = shuffledColors[index];
  }

  return revealTopSegments({
    ...state,
    vials: state.vials.map((currentVial, currentIndex) =>
      currentIndex === vialIndex ? shuffledVial : currentVial
    ),
    selectedVial: null,
  });
}

export function addEmptyVial(state: GameState): GameState {
  return {
    ...state,
    vials: [...state.vials, []],
    hidden: [...state.hidden, []],
    vialModifiers: [...state.vialModifiers, 'none'],
    addedVial: true,
    selectedVial: null,
  };
}

export function hasMovesLeft(state: GameState): boolean {
  for (let sourceIndex = 0; sourceIndex < state.vials.length; sourceIndex += 1) {
    const source = state.vials[sourceIndex];
    const sourceHidden = state.hidden[sourceIndex] ?? [];
    const sourceHasHidden = sourceHidden.some(Boolean);
    const sourceModifier = getVialModifier(state.vialModifiers, sourceIndex);

    if (
      source.length === 0 ||
      !canUseVialAsSource(sourceModifier) ||
      isCompletedVisibleVial(source, sourceHidden)
    ) {
      continue;
    }

    const topColor = getTopColor(source);
    const topCount = getTopRevealedCount(source, sourceHidden);

    if (!topColor || topCount === 0) {
      continue;
    }

    const wouldEmptySource = topCount === source.length;
    const sourceIsUniform = source.every((color) => color === topColor);

    for (let destIndex = 0; destIndex < state.vials.length; destIndex += 1) {
      if (sourceIndex === destIndex) {
        continue;
      }

      const dest = state.vials[destIndex];
      const destModifier = getVialModifier(state.vialModifiers, destIndex);

      if (!canPour(source, dest, sourceModifier, destModifier)) {
        continue;
      }

      if (sourceIsUniform && !wouldEmptySource && !sourceHasHidden) {
        if (dest.length === 0 || dest.length + topCount < VIAL_CAPACITY) {
          continue;
        }
      }

      if (!isReversibleSuperficialMove(state, sourceIndex, destIndex)) {
        return true;
      }
    }
  }

  return false;
}

export function hasMovesLeftOnBoard(
  vials: GameState['vials'],
  hidden: GameState['hidden'],
  vialModifiers: GameState['vialModifiers']
): boolean {
  return hasMovesLeft(createMoveAnalysisState(vials, hidden, vialModifiers));
}

export function analyzeMoveAvailability(state: GameState): MoveAnalysis {
  const skipCounts: Record<MoveSkipReason, number> = {
    'source-empty': 0,
    'source-blocked-by-modifier': 0,
    'source-complete-revealed': 0,
    'same-vial': 0,
    'target-blocked-by-modifier': 0,
    'cannot-pour': 0,
    'no-revealed-top': 0,
    'superficial-empty-transfer': 0,
    'superficial-non-completing': 0,
    'superficial-loop': 0,
  };

  const validMoves: MoveDebugEntry[] = [];
  const skippedMoves: MoveDebugEntry[] = [];

  for (let sourceIndex = 0; sourceIndex < state.vials.length; sourceIndex += 1) {
    const source = state.vials[sourceIndex];
    const sourceHidden = state.hidden[sourceIndex] ?? [];
    const sourceHiddenCount = sourceHidden.filter(Boolean).length;
    const sourceHasHidden = sourceHiddenCount > 0;
    const sourceModifier = getVialModifier(state.vialModifiers, sourceIndex);

    if (source.length === 0) {
      skipCounts['source-empty'] += 1;
      skippedMoves.push({
        from: sourceIndex,
        to: sourceIndex,
        reason: 'source-empty',
        sourceLength: 0,
        destLength: 0,
        sourceHiddenCount,
      });
      continue;
    }

    if (!canUseVialAsSource(sourceModifier)) {
      skipCounts['source-blocked-by-modifier'] += 1;
      skippedMoves.push({
        from: sourceIndex,
        to: sourceIndex,
        reason: 'source-blocked-by-modifier',
        sourceLength: source.length,
        destLength: source.length,
        sourceHiddenCount,
      });
      continue;
    }

    if (isCompletedVisibleVial(source, sourceHidden)) {
      skipCounts['source-complete-revealed'] += 1;
      skippedMoves.push({
        from: sourceIndex,
        to: sourceIndex,
        reason: 'source-complete-revealed',
        sourceLength: source.length,
        destLength: source.length,
        sourceHiddenCount,
      });
      continue;
    }

    for (let destIndex = 0; destIndex < state.vials.length; destIndex += 1) {
      const dest = state.vials[destIndex];
      const destModifier = getVialModifier(state.vialModifiers, destIndex);

      if (sourceIndex === destIndex) {
        skipCounts['same-vial'] += 1;
        skippedMoves.push({
          from: sourceIndex,
          to: destIndex,
          reason: 'same-vial',
          sourceLength: source.length,
          destLength: dest.length,
          sourceHiddenCount,
        });
        continue;
      }

      if (!canUseVialAsTarget(destModifier)) {
        skipCounts['target-blocked-by-modifier'] += 1;
        skippedMoves.push({
          from: sourceIndex,
          to: destIndex,
          reason: 'target-blocked-by-modifier',
          sourceLength: source.length,
          destLength: dest.length,
          sourceHiddenCount,
        });
        continue;
      }

      if (!canPour(source, dest, sourceModifier, destModifier)) {
        skipCounts['cannot-pour'] += 1;
        skippedMoves.push({
          from: sourceIndex,
          to: destIndex,
          reason: 'cannot-pour',
          sourceLength: source.length,
          destLength: dest.length,
          sourceHiddenCount,
        });
        continue;
      }

      const topColor = getTopColor(source);
      const topCount = getTopRevealedCount(source, sourceHidden);

      if (!topColor || topCount === 0) {
        skipCounts['no-revealed-top'] += 1;
        skippedMoves.push({
          from: sourceIndex,
          to: destIndex,
          reason: 'no-revealed-top',
          sourceLength: source.length,
          destLength: dest.length,
          sourceHiddenCount,
        });
        continue;
      }

      const wouldEmptySource = topCount === source.length;

      if (isVialComplete(source) || source.every((color) => color === topColor)) {
        if (!wouldEmptySource && !sourceHasHidden) {
          if (dest.length === 0) {
            skipCounts['superficial-empty-transfer'] += 1;
            skippedMoves.push({
              from: sourceIndex,
              to: destIndex,
              reason: 'superficial-empty-transfer',
              sourceLength: source.length,
              destLength: dest.length,
              sourceHiddenCount,
            });
            continue;
          }

          if (dest.length + topCount < VIAL_CAPACITY) {
            skipCounts['superficial-non-completing'] += 1;
            skippedMoves.push({
              from: sourceIndex,
              to: destIndex,
              reason: 'superficial-non-completing',
              sourceLength: source.length,
              destLength: dest.length,
              sourceHiddenCount,
            });
            continue;
          }
        }
      }

      if (isReversibleSuperficialMove(state, sourceIndex, destIndex)) {
        skipCounts['superficial-loop'] += 1;
        skippedMoves.push({
          from: sourceIndex,
          to: destIndex,
          reason: 'superficial-loop',
          sourceLength: source.length,
          destLength: dest.length,
          sourceHiddenCount,
        });
        continue;
      }

      validMoves.push({
        from: sourceIndex,
        to: destIndex,
        reason: 'valid',
        moveCount: Math.min(topCount, VIAL_CAPACITY - dest.length),
        sourceLength: source.length,
        destLength: dest.length,
        sourceHiddenCount,
      });
    }
  }

  return {
    hasMovesLeft: validMoves.length > 0,
    validMoves,
    skippedMoves,
    skipCounts,
  };
}

export function analyzeMoveAvailabilityOnBoard(
  vials: GameState['vials'],
  hidden: GameState['hidden'],
  vialModifiers: GameState['vialModifiers']
): MoveAnalysis {
  return analyzeMoveAvailability(createMoveAnalysisState(vials, hidden, vialModifiers));
}

export function calculateReward(level: number, moveCount: number): number {
  const base = Math.min(3 + Math.floor(level / 5), 8);
  const efficiency = Math.max(0, 30 - moveCount);
  const bonus = Math.floor(efficiency / 10);

  return base + bonus;
}
