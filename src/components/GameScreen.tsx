import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { GameBoard } from './GameBoard';
import { WinModal } from './WinModal';
import { ConfirmModal } from './ConfirmModal';
import { MoveDebugPanel } from '../debug/MoveDebugPanel';
import { useMoveDebug } from '../debug/useMoveDebug';
import { playSoundEffect } from '../audio/sfx';
import { canAddExtraVial, canShuffleSelectedVial, canUndoMove, getLevelReward } from '../game/selectors';
import { hasMovesLeft } from '../game/engine';
import { UNDO_COST } from '../game/types';

type GameScreenProps = {
  onReturnToSplash: () => void;
};

export function GameScreen({ onReturnToSplash }: GameScreenProps) {
  const { state, selectVial, undoMove, restart, nextLevel, shuffleSelected, addVial, resetGame } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);

  const boardHasMovesLeft = useMemo(
    () => hasMovesLeft(state),
    [state.vials, state.hidden, state.vialModifiers]
  );
  const canUndo = canUndoMove(state);
  const canShuffle = canShuffleSelectedVial(state);
  const canAddVial = canAddExtraVial(state);
  const coinsEarned = getLevelReward(state);
  const canUndoFromStuckModal = canUndo;

  const stuck = !state.won && state.moveHistory.length > 0 && !boardHasMovesLeft;

  const prevStuckRef = useRef(stuck);
  useEffect(() => {
    if (stuck && !prevStuckRef.current) {
      playSoundEffect('noMoves');
    }
    prevStuckRef.current = stuck;
  }, [stuck]);

  return (
    <div className="app">
      <Header
        level={state.level}
        moveCount={state.moveCount}
        onTitleClick={() => setShowReturnConfirm(true)}
        onRestart={restart}
        onResetGame={() => setShowResetConfirm(true)}
      />
      <Toolbar
        coins={state.coins}
        canUndo={canUndo}
        canShuffle={canShuffle}
        canAddVial={canAddVial}
        selectedVial={state.selectedVial}
        onUndo={undoMove}
        onShuffle={() => {
          if (state.selectedVial !== null) shuffleSelected(state.selectedVial);
        }}
        onAddVial={addVial}
      />
      <GameBoard state={state} onSelectVial={selectVial} />
      <WinModal
        visible={state.won}
        level={state.level}
        moveCount={state.moveCount}
        coinsEarned={coinsEarned}
        onNextLevel={nextLevel}
      />
      <ConfirmModal
        visible={showResetConfirm}
        title="Reset Game?"
        message="This will erase all progress and return you to Level 1 with starter coins. This cannot be undone."
        confirmLabel="Reset Game"
        onConfirm={() => {
          resetGame();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
      <ConfirmModal
        visible={stuck}
        title="No Moves Left!"
        message={
          canUndoFromStuckModal
            ? 'There are no valid moves remaining. You can restart the level or undo moves to try a different approach.'
            : 'There are no valid moves remaining. Restart the level to try a different approach.'
        }
        confirmLabel="Restart Level"
        onConfirm={restart}
        onCancel={undoMove}
        cancelLabel={canUndoFromStuckModal ? `Undo (${UNDO_COST} coins)` : null}
        closeOnOverlayClick={false}
        icon="!"
      />
      <ConfirmModal
        visible={showReturnConfirm}
        title="Return to splash screen?"
        message="Your current vial layout will reset, but your saved level and coins will stay."
        confirmLabel="Return to Splash"
        onConfirm={() => {
          setShowReturnConfirm(false);
          onReturnToSplash();
        }}
        onCancel={() => setShowReturnConfirm(false)}
        icon="?"
      />

      {import.meta.env.DEV && <DevMoveDebugPanel state={state} />}
    </div>
  );
}

function DevMoveDebugPanel({ state }: { state: import('../game/types').GameState }) {
  const { moveAnalysis, movesRemaining, totalCandidates, validMovePreview, skipSummary } = useMoveDebug(state);

  return (
    <MoveDebugPanel
      moveAnalysis={moveAnalysis}
      movesRemaining={movesRemaining}
      totalCandidates={totalCandidates}
      validMovePreview={validMovePreview}
      skipSummary={skipSummary}
    />
  );
}
