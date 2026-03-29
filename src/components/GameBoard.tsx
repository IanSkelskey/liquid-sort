import { Vial } from './Vial';
import { COLOR_VALUES, type GameState } from '../game/types';
import { isBoardVialComplete } from '../game/selectors';
import './GameBoard.css';

interface GameBoardProps {
  state: GameState;
  onSelectVial: (index: number) => void;
}

export function GameBoard({ state, onSelectVial }: GameBoardProps) {
  return (
    <div className="game-board">
      {state.vials.map((vial, i) => (
        <Vial
          key={i}
          segments={vial.map((color) => COLOR_VALUES[color])}
          hiddenMask={state.hidden[i] ?? []}
          isSelected={state.selectedVial === i}
          isComplete={isBoardVialComplete(state, i)}
          onClick={() => onSelectVial(i)}
        />
      ))}
    </div>
  );
}
