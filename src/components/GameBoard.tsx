import { memo, useMemo } from 'react';
import { Vial } from './Vial';
import { COLOR_VALUES, type GameState } from '../game/types';
import { isBoardVialComplete } from '../game/selectors';
import './GameBoard.css';

interface GameBoardProps {
  state: GameState;
  onSelectVial: (index: number) => void;
}

export const GameBoard = memo(function GameBoard({ state, onSelectVial }: GameBoardProps) {
  const segmentsByVial = useMemo(
    () => state.vials.map((vial) => vial.map((color) => COLOR_VALUES[color])),
    [state.vials]
  );

  const completionByVial = useMemo(
    () => state.vials.map((_, i) => isBoardVialComplete(state, i)),
    [state.vials, state.hidden]
  );

  return (
    <div className="game-board">
      {state.vials.map((_vial, i) => (
        <Vial
          key={i}
          segments={segmentsByVial[i]}
          hiddenMask={state.hidden[i] ?? []}
          modifier={state.vialModifiers[i] ?? 'none'}
          isSelected={state.selectedVial === i}
          isComplete={completionByVial[i]}
          onClick={onSelectVial}
          index={i}
        />
      ))}
    </div>
  );
});
