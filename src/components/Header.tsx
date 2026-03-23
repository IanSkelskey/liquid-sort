import './Header.css';

interface HeaderProps {
  level: number;
  moveCount: number;
  onRestart: () => void;
  onResetGame: () => void;
}

export function Header({ level, moveCount, onRestart, onResetGame }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-info">
        <h1 className="header-title">Liquid Sort</h1>
        <div className="header-stats">
          <span className="header-level">Level {level}</span>
          <span className="header-separator">·</span>
          <span className="header-moves">Moves: {moveCount}</span>
        </div>
      </div>
      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onRestart}
          title="Restart level"
        >
          ↻ Restart
        </button>
        <button
          className="header-btn header-btn--danger"
          onClick={onResetGame}
          title="Reset all progress"
        >
          ✕ Reset
        </button>
      </div>
    </header>
  );
}
