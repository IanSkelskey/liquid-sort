import { useReducer, useCallback, useEffect, useRef } from 'react';
import { type GameState, UNDO_COST, SHUFFLE_COST, ADD_VIAL_COST, VIAL_CAPACITY } from '../game/types';
import { pour, undo, shuffleVial, addEmptyVial, calculateReward } from '../game/engine';
import { createGameState, getSavedLevel, saveLevel, saveCoins, clearSave } from '../game/levels';
import { useSoundEffects } from './useSoundEffects';

const POUR_SOUND_BASE_MS = 120;
const POUR_SOUND_PER_SEGMENT_MS = 130;

function getPourSoundDuration(segmentCount: number): number {
  return POUR_SOUND_BASE_MS + segmentCount * POUR_SOUND_PER_SEGMENT_MS;
}

function shouldPlayPickupOnClick(state: GameState, index: number): boolean {
  if (state.won) return false;

  if (state.selectedVial === null) {
    return state.vials[index].length > 0;
  }

  if (state.selectedVial === index) {
    return false;
  }

  return state.vials[index].length > 0 && !pour(state, state.selectedVial, index);
}

function isCompletedVial(vial: GameState['vials'][number], hidden: boolean[] = []): boolean {
  return (
    vial.length === VIAL_CAPACITY &&
    vial.every((color) => color === vial[0]) &&
    !hidden.some((isHidden) => isHidden)
  );
}

type Action =
  | { type: 'SELECT_VIAL'; index: number }
  | { type: 'UNDO' }
  | { type: 'RESTART' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'SHUFFLE_VIAL'; index: number }
  | { type: 'ADD_VIAL' }
  | { type: 'RESET_GAME' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_VIAL': {
      if (state.won) return state;
      const { index } = action;

      // Nothing selected yet — select this vial (if non-empty)
      if (state.selectedVial === null) {
        if (state.vials[index].length === 0) return state;
        return { ...state, selectedVial: index };
      }

      // Same vial tapped — deselect
      if (state.selectedVial === index) {
        return { ...state, selectedVial: null };
      }

      // Try to pour from selected into tapped
      const result = pour(state, state.selectedVial, index);
      if (result) {
        if (result.won) {
          const reward = calculateReward(state.level, result.moveCount);
          const newCoins = result.coins + reward;
          saveCoins(newCoins);
          return { ...result, coins: newCoins };
        }
        return result;
      }

      // Pour failed — if tapped vial is non-empty, select it instead
      if (state.vials[index].length > 0) {
        return { ...state, selectedVial: index };
      }

      // Otherwise deselect
      return { ...state, selectedVial: null };
    }

    case 'UNDO': {
      if (state.won) return state;
      if (state.coins < UNDO_COST) return state;
      const result = undo(state);
      if (!result) return state;
      const newCoins = result.coins - UNDO_COST;
      saveCoins(newCoins);
      return { ...result, coins: newCoins };
    }

    case 'RESTART': {
      return createGameState(state.level, state.coins);
    }

    case 'NEXT_LEVEL': {
      const nextLevel = state.level + 1;
      saveLevel(nextLevel);
      return createGameState(nextLevel, state.coins);
    }

    case 'SHUFFLE_VIAL': {
      if (state.won) return state;
      if (state.coins < SHUFFLE_COST) return state;
      const { index } = action;
      if (state.vials[index].length <= 1) return state;
      const newCoins = state.coins - SHUFFLE_COST;
      saveCoins(newCoins);
      return { ...shuffleVial(state, index), coins: newCoins };
    }

    case 'ADD_VIAL': {
      if (state.won) return state;
      if (state.coins < ADD_VIAL_COST) return state;
      if (state.addedVial) return state;
      const newCoins = state.coins - ADD_VIAL_COST;
      saveCoins(newCoins);
      return { ...addEmptyVial(state), coins: newCoins };
    }

    case 'RESET_GAME': {
      clearSave();
      return createGameState(1);
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, null, () =>
    createGameState(getSavedLevel())
  );
  const { play } = useSoundEffects();
  const previousWonRef = useRef(state.won);
  const previousAddedVialRef = useRef(state.addedVial);

  useEffect(() => {
    if (!previousWonRef.current && state.won) {
      play('levelComplete');
    }

    previousWonRef.current = state.won;
  }, [play, state.won]);

  useEffect(() => {
    if (!previousAddedVialRef.current && state.addedVial) {
      play('addVial');
      play('popUp');
    }

    previousAddedVialRef.current = state.addedVial;
  }, [play, state.addedVial]);

  const selectVial = useCallback(
    (index: number) => {
      if (shouldPlayPickupOnClick(state, index)) {
        play('pickupVial');
      }

      const nextState = reducer(state, { type: 'SELECT_VIAL', index });
      const lastMove = nextState.moveHistory[nextState.moveHistory.length - 1];
      const moveCountIncreased = nextState.moveHistory.length > state.moveHistory.length;

      if (moveCountIncreased && lastMove) {
        play('pour', { durationMs: getPourSoundDuration(lastMove.count) });

        const targetIndex = lastMove.to;
        const wasComplete = isCompletedVial(
          state.vials[targetIndex],
          state.hidden[targetIndex] ?? []
        );
        const isNowComplete = isCompletedVial(
          nextState.vials[targetIndex],
          nextState.hidden[targetIndex] ?? []
        );

        if (!wasComplete && isNowComplete) {
          play('vialFull');
        }
      }

      dispatch({ type: 'SELECT_VIAL', index });
    },
    [play, state]
  );

  const undoMove = useCallback(() => {
    play('undo');
    dispatch({ type: 'UNDO' });
  }, [play]);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const nextLevel = useCallback(() => dispatch({ type: 'NEXT_LEVEL' }), []);

  const shuffleSelected = useCallback(
    (index: number) => {
      play('shuffle');
      dispatch({ type: 'SHUFFLE_VIAL', index });
    },
    [play]
  );

  const addVial = useCallback(() => dispatch({ type: 'ADD_VIAL' }), []);
  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);

  return { state, selectVial, undoMove, restart, nextLevel, shuffleSelected, addVial, resetGame };
}
