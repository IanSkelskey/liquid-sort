import { Coins, FlaskConical, Shuffle, Undo2 } from 'lucide-react';
import { UNDO_COST, SHUFFLE_COST, ADD_VIAL_COST } from '../game/types';
import './Toolbar.css';

interface ToolbarProps {
  coins: number;
  canUndo: boolean;
  canShuffle: boolean;
  canAddVial: boolean;
  selectedVial: number | null;
  onUndo: () => void;
  onShuffle: () => void;
  onAddVial: () => void;
}

export function Toolbar({
  coins,
  canUndo,
  canShuffle,
  canAddVial,
  selectedVial,
  onUndo,
  onShuffle,
  onAddVial,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-coins">
        <Coins className="toolbar-coins-icon" aria-hidden="true" />
        <span className="coin-count">{coins}</span>
      </div>
      <div className="toolbar-powers">
        <button
          className="power-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title={`Undo last move (${UNDO_COST} coins)`}
        >
          <span className="power-icon" aria-hidden="true">
            <Undo2 />
          </span>
          <span className="power-label">Undo</span>
          <span className="power-cost">
            <Coins className="power-cost-icon" aria-hidden="true" />
            <span>{UNDO_COST}</span>
          </span>
        </button>
        <button
          className="power-btn"
          onClick={onShuffle}
          disabled={!canShuffle}
          title={
            selectedVial === null
              ? 'Select a vial first, then shuffle'
              : `Shuffle selected vial (${SHUFFLE_COST} coins)`
          }
        >
          <span className="power-icon" aria-hidden="true">
            <Shuffle />
          </span>
          <span className="power-label">Shuffle</span>
          <span className="power-cost">
            <Coins className="power-cost-icon" aria-hidden="true" />
            <span>{SHUFFLE_COST}</span>
          </span>
        </button>
        <button
          className="power-btn"
          onClick={onAddVial}
          disabled={!canAddVial}
          title={`Add an extra empty vial (${ADD_VIAL_COST} coins, once per level)`}
        >
          <span className="power-icon" aria-hidden="true">
            <FlaskConical />
          </span>
          <span className="power-label">Add Vial</span>
          <span className="power-cost">
            <Coins className="power-cost-icon" aria-hidden="true" />
            <span>{ADD_VIAL_COST}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
