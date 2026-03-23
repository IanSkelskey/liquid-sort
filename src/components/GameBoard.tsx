import { Vial } from './Vial';
import { type GameState, VIAL_CAPACITY } from '../game/types';
import './GameBoard.css';

interface GameBoardProps {
  state: GameState;
  onSelectVial: (index: number) => void;
}

function isVialComplete(vial: string[]): boolean {
  return (
    vial.length === VIAL_CAPACITY && vial.every((c) => c === vial[0])
  );
}

export function GameBoard({ state, onSelectVial }: GameBoardProps) {
  return (
    <div className="game-board">
      {state.vials.map((vial, i) => (
        <Vial
          key={i}
          vial={vial}
          isSelected={state.selectedVial === i}
          isComplete={isVialComplete(vial)}
          onClick={() => onSelectVial(i)}
        />
      ))}
    </div>
  );
}
