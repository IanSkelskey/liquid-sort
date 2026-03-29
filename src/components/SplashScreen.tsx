import { CircleHelp, Heart, Play, Sparkles } from 'lucide-react';
import { COLOR_VALUES } from '../game/types';
import { LiquidSortWordmark } from './LiquidSortWordmark';
import { Vial } from './Vial';

import './SplashScreen.css';

type SplashScreenProps = {
  onStart: () => void;
  onHowToPlay?: () => void;
};

export default function SplashScreen({
  onStart,
  onHowToPlay,
}: SplashScreenProps) {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-badge">
          <Sparkles className="splash-badge-icon" aria-hidden="true" />
          <span>Alchemical Puzzle Game</span>
        </div>
        <h1 className="splash-title">
          <LiquidSortWordmark variant="hero" />
        </h1>
        <div className="splash-vial-row" aria-hidden="true">
          {Object.values(COLOR_VALUES).slice(0, 5).map((color, index) => (
            <Vial
              key={index}
              variant="splash"
              segments={[color, color, color]}
            />
          ))}
        </div>

        <div className="splash-actions">
          <button className="splash-btn splash-btn-primary" onClick={onStart}>
            <span className="splash-btn-icon" aria-hidden="true">
              <Play fill="currentColor" />
            </span>
            <span className="splash-btn-label">Play</span>
          </button>
          {onHowToPlay && (
            <button className="splash-btn splash-btn-secondary" onClick={onHowToPlay}>
              <span className="splash-btn-icon" aria-hidden="true">
                <CircleHelp />
              </span>
              <span className="splash-btn-label">How to Play</span>
            </button>
          )}
        </div>

        <div className="splash-footer">
          <span className="splash-footer-text">
            <span className="splash-footer-label">Made with</span>
            <span className="splash-footer-heart" aria-hidden="true">
              <Heart fill="currentColor" />
            </span>
            <span className="splash-footer-label">by </span>
            <a
              className="splash-footer-link"
              href="https://github.com/IanSkelskey"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ian Skelskey
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
