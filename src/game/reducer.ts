import { canSelectVialAsSource } from './selectors';
import { ADD_VIAL_COST, SHUFFLE_COST, type GameState, UNDO_COST } from './types';
import { addEmptyVial, calculateReward, pour, shuffleVial, undo } from './engine';
import { createGameState } from './levels';

export type GameAction =
  | { type: 'SELECT_VIAL'; index: number }
  | { type: 'UNDO' }
  | { type: 'RESTART' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'SHUFFLE_VIAL'; index: number }
  | { type: 'ADD_VIAL' }
  | { type: 'RESET_GAME' };

export function reduceGameState(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_VIAL': {
      if (state.won) {
        return state;
      }

      const { index } = action;

      if (state.selectedVial === null) {
        return canSelectVialAsSource(state, index) ? { ...state, selectedVial: index } : state;
      }

      if (state.selectedVial === index) {
        return { ...state, selectedVial: null };
      }

      const nextState = pour(state, state.selectedVial, index);

      if (nextState) {
        if (!nextState.won) {
          return nextState;
        }

        const reward = calculateReward(state.level, nextState.moveCount);
        return {
          ...nextState,
          coins: nextState.coins + reward,
        };
      }

      return canSelectVialAsSource(state, index)
        ? { ...state, selectedVial: index }
        : { ...state, selectedVial: null };
    }

    case 'UNDO': {
      if (state.won || state.coins < UNDO_COST) {
        return state;
      }

      const nextState = undo(state);

      return nextState ? { ...nextState, coins: nextState.coins - UNDO_COST } : state;
    }

    case 'RESTART':
      return createGameState(state.level, state.coins);

    case 'NEXT_LEVEL':
      return createGameState(state.level + 1, state.coins);

    case 'SHUFFLE_VIAL': {
      if (state.won || state.coins < SHUFFLE_COST) {
        return state;
      }

      const { index } = action;

      if (state.vials[index].length <= 1) {
        return state;
      }

      return {
        ...shuffleVial(state, index),
        coins: state.coins - SHUFFLE_COST,
      };
    }

    case 'ADD_VIAL': {
      if (state.won || state.coins < ADD_VIAL_COST || state.addedVial) {
        return state;
      }

      return {
        ...addEmptyVial(state),
        coins: state.coins - ADD_VIAL_COST,
      };
    }

    case 'RESET_GAME':
      return createGameState(1);

    default:
      return state;
  }
}
