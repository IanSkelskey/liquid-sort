import { Vial } from './Vial';
import { type GameState, VIAL_CAPACITY } from '../game/types';
import './GameBoard.css';

interface GameBoardProps {
  state: GameState;
  onSelectVial: (index: number) => void;
}

function isVialComplete(vial: string[], hidden: boolean[]): boolean {
  return (
    vial.length === VIAL_CAPACITY &&
    vial.every((c) => c === vial[0]) &&
    !hidden.some((h) => h)
  );
}

export function GameBoard({ state, onSelectVial }: GameBoardProps) {
  return (
    <div className="game-board">
      {state.vials.map((vial, i) => (
        <Vial
          key={i}
          vial={vial}
          hiddenMask={state.hidden[i] ?? []}
          isSelected={state.selectedVial === i}
          isComplete={isVialComplete(vial, state.hidden[i] ?? [])}
          onClick={() => onSelectVial(i)}
        />
      ))}
    </div>
  );
}
