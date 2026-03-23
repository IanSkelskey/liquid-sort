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
        <span className="coin-icon">🪙</span>
        <span className="coin-count">{coins}</span>
      </div>
      <div className="toolbar-powers">
        <button
          className="power-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title={`Undo last move (${UNDO_COST} coin)`}
        >
          <span className="power-icon">↩️</span>
          <span className="power-label">Undo</span>
          <span className="power-cost">{UNDO_COST} 🪙</span>
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
          <span className="power-icon">🔀</span>
          <span className="power-label">Shuffle</span>
          <span className="power-cost">{SHUFFLE_COST} 🪙</span>
        </button>
        <button
          className="power-btn"
          onClick={onAddVial}
          disabled={!canAddVial}
          title={`Add an extra empty vial (${ADD_VIAL_COST} coins, once per level)`}
        >
          <span className="power-icon">🧪</span>
          <span className="power-label">Add Vial</span>
          <span className="power-cost">{ADD_VIAL_COST} 🪙</span>
        </button>
      </div>
    </div>
  );
}
