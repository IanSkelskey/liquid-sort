import { useState, useEffect, useRef } from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { GameBoard } from './components/GameBoard';
import { WinModal } from './components/WinModal';
import { ConfirmModal } from './components/ConfirmModal';
import { UNDO_COST, SHUFFLE_COST, ADD_VIAL_COST } from './game/types';
import { calculateReward } from './game/engine';
import { MoveDebugPanel } from './debug/MoveDebugPanel';
import { useMoveDebug } from './debug/useMoveDebug';
import { playMusic } from './audio/music';
import { AudioControls } from './components/AudioControls';
import { playSoundEffect } from './audio/sfx';
import SplashScreen from './components/SplashScreen';
import { SceneBackground } from './components/SceneBackground';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started ? (
        <SplashScreen
          onStart={() => setStarted(true)}
          onHowToPlay={() => {}}
        />
      ) : (
        <LiquidSortGame />
      )}
      <AudioControls />
    </>
  );
}

function LiquidSortGame() {
  const { state, selectVial, undoMove, restart, nextLevel, shuffleSelected, addVial, resetGame } = useGame();

  // Start background music on first user interaction
  const [musicStarted, setMusicStarted] = useState(false);

  useEffect(() => {
    if (musicStarted) return;
    const handler = () => {
      void playMusic().then((ok) => {
        if (ok) setMusicStarted(true);
      });
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [musicStarted]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { moveAnalysis, movesRemaining, totalCandidates, validMovePreview, skipSummary } = useMoveDebug(state);

  const coinsEarned = state.won ? calculateReward(state.level, state.moveCount) : 0;
  const stuck = !state.won && state.moveHistory.length > 0 && !moveAnalysis.hasMovesLeft;

  const prevStuckRef = useRef(stuck);
  useEffect(() => {
    if (stuck && !prevStuckRef.current) {
      playSoundEffect('noMoves');
    }
    prevStuckRef.current = stuck;
  }, [stuck]);

  return (
    <SceneBackground variant="game">
      <div className="app">
        <Header
          level={state.level}
          moveCount={state.moveCount}
          onRestart={restart}
          onResetGame={() => setShowResetConfirm(true)}
        />
        <Toolbar
          coins={state.coins}
          canUndo={
            state.moveHistory.length > 0 &&
            !state.won &&
            state.coins >= UNDO_COST
          }
          canShuffle={
            state.selectedVial !== null &&
            state.coins >= SHUFFLE_COST &&
            state.vials[state.selectedVial].length > 1 &&
            !state.won
          }
          canAddVial={state.coins >= ADD_VIAL_COST && !state.addedVial && !state.won}
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
          message="There are no valid moves remaining. You can restart the level or undo moves to try a different approach."
          confirmLabel="↻ Restart Level"
          onConfirm={restart}
          onCancel={undoMove}
          cancelLabel={state.coins >= UNDO_COST ? `↩ Undo (${UNDO_COST}🪙)` : undefined}
          icon="😵"
        />

        <MoveDebugPanel
          moveAnalysis={moveAnalysis}
          movesRemaining={movesRemaining}
          totalCandidates={totalCandidates}
          validMovePreview={validMovePreview}
          skipSummary={skipSummary}
        />
      </div>
    </SceneBackground>
  )
}

export default App;
