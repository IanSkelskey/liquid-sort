import { ADD_VIAL_COST, SHUFFLE_COST, type GameState, type Vial, UNDO_COST } from './types';
import { calculateReward } from './engine';
import { isCompletedVisibleVial } from './rules';

export function isBoardVialComplete(state: GameState, vialIndex: number): boolean {
  return isCompletedVisibleVial(state.vials[vialIndex], state.hidden[vialIndex] ?? []);
}

export function isCompleteVial(vial: Vial, hidden: boolean[] = []): boolean {
  return isCompletedVisibleVial(vial, hidden);
}

export function canUndoMove(state: GameState): boolean {
  return state.moveHistory.length > 0 && !state.won && state.coins >= UNDO_COST;
}

export function canShuffleSelectedVial(state: GameState): boolean {
  return (
    state.selectedVial !== null &&
    state.coins >= SHUFFLE_COST &&
    state.vials[state.selectedVial].length > 1 &&
    !state.won
  );
}

export function canAddExtraVial(state: GameState): boolean {
  return state.coins >= ADD_VIAL_COST && !state.addedVial && !state.won;
}

export function getLevelReward(state: GameState): number {
  return state.won ? calculateReward(state.level, state.moveCount) : 0;
}
