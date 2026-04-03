import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import type { GameState } from '../game/types';
import { createGameState } from '../game/levels';
import { preloadLevelDefinition } from '../game/levelGeneration/preload';
import { reduceGameState } from '../game/reducer';
import { isCompletedVisibleVial, canPour, getTopRevealedCount } from '../game/rules';
import { canAddExtraVial, canSelectVialAsSource, canShuffleSelectedVial, canUndoMove } from '../game/selectors';
import { getVialModifier } from '../game/modifiers';
import { clearSave, getSavedLevel, saveCoins, saveLevel } from '../game/storage';
import { useSoundEffects } from './useSoundEffects';

const POUR_SOUND_BASE_MS = 120;
const POUR_SOUND_PER_SEGMENT_MS = 130;

function getPourSoundDuration(segmentCount: number): number {
  return POUR_SOUND_BASE_MS + segmentCount * POUR_SOUND_PER_SEGMENT_MS;
}

function canAttemptPour(state: GameState, fromIndex: number, toIndex: number): boolean {
  const source = state.vials[fromIndex];
  const dest = state.vials[toIndex];
  const sourceHidden = state.hidden[fromIndex] ?? [];
  const sourceModifier = getVialModifier(state.vialModifiers, fromIndex);
  const destModifier = getVialModifier(state.vialModifiers, toIndex);

  if (fromIndex === toIndex || !canPour(source, dest, sourceModifier, destModifier)) {
    return false;
  }

  if (isCompletedVisibleVial(source, sourceHidden)) {
    return false;
  }

  return getTopRevealedCount(source, sourceHidden) > 0;
}

function shouldPlayPickupOnClick(state: GameState, index: number): boolean {
  if (state.won) {
    return false;
  }

  if (state.selectedVial === null) {
    return canSelectVialAsSource(state, index);
  }

  if (state.selectedVial === index) {
    return false;
  }

  return canSelectVialAsSource(state, index) && !canAttemptPour(state, state.selectedVial, index);
}

export function useGame() {
  const [state, dispatch] = useReducer(reduceGameState, null, () =>
    createGameState(getSavedLevel())
  );
  const { play } = useSoundEffects();
  const previousStateRef = useRef(state);
  const stateRef = useRef(state);

  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    preloadLevelDefinition(state.level + 1);
    preloadLevelDefinition(state.level + 2);
  }, [state.level]);

  useEffect(() => {
    const previousState = previousStateRef.current;

    if (previousState.level !== state.level) {
      saveLevel(state.level);
    }

    if (previousState.coins !== state.coins) {
      saveCoins(state.coins);
    }

    if (!previousState.won && state.won) {
      play('levelComplete');
    }

    if (!previousState.addedVial && state.addedVial) {
      play('addVial');
      play('popUp');
    }

    if (state.moveHistory.length > previousState.moveHistory.length) {
      const lastMove = state.moveHistory[state.moveHistory.length - 1];

      if (lastMove) {
        play('pour', { durationMs: getPourSoundDuration(lastMove.count) });

        const targetIndex = lastMove.to;
        const wasComplete = isCompletedVisibleVial(
          previousState.vials[targetIndex],
          previousState.hidden[targetIndex] ?? []
        );
        const isNowComplete = isCompletedVisibleVial(
          state.vials[targetIndex],
          state.hidden[targetIndex] ?? []
        );

        if (!wasComplete && isNowComplete) {
          play('vialFull');
        }
      }
    }

    previousStateRef.current = state;
  }, [play, state]);

  const selectVial = useCallback(
    (index: number) => {
      if (shouldPlayPickupOnClick(stateRef.current, index)) {
        play('pickupVial');
      } else if (stateRef.current.selectedVial === index) {
        play('putDownVial');
      }

      dispatch({ type: 'SELECT_VIAL', index });
    },
    [play]
  );

  const undoMove = useCallback(() => {
    if (!canUndoMove(stateRef.current)) {
      return;
    }

    play('undo');
    dispatch({ type: 'UNDO' });
  }, [play]);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const nextLevel = useCallback(() => {
    dispatch({ type: 'NEXT_LEVEL' });
  }, []);

  const shuffleSelected = useCallback(
    (index: number) => {
      if (!canShuffleSelectedVial(stateRef.current) || stateRef.current.selectedVial !== index) {
        return;
      }

      play('shuffle');
      dispatch({ type: 'SHUFFLE_VIAL', index });
    },
    [play]
  );

  const addVial = useCallback(() => {
    if (!canAddExtraVial(stateRef.current)) {
      return;
    }

    dispatch({ type: 'ADD_VIAL' });
  }, []);

  const resetGame = useCallback(() => {
    clearSave();
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    selectVial,
    undoMove,
    restart,
    nextLevel,
    shuffleSelected,
    addVial,
    resetGame,
  };
}
