import { memo } from 'react';
import { Vial } from './Vial';
import type { GameState } from '../game/types';
import { isBoardVialComplete } from '../game/selectors';
import './GameBoard.css';

interface GameBoardProps {
  state: GameState;
  onSelectVial: (index: number) => void;
}

export const GameBoard = memo(function GameBoard({ state, onSelectVial }: GameBoardProps) {
  return (
    <div className="game-board">
      {state.vials.map((_vial, i) => (
        <Vial
          key={i}
          segments={state.vials[i]}
          hiddenMask={state.hidden[i] ?? []}
          modifier={state.vialModifiers[i] ?? 'none'}
          isSelected={state.selectedVial === i}
          isComplete={isBoardVialComplete(state, i)}
          onClick={onSelectVial}
          index={i}
        />
      ))}
    </div>
  );
});
