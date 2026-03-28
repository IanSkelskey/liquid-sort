import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Coins, Sparkles, Trophy } from 'lucide-react';
import './WinModal.css';

interface WinModalProps {
  visible: boolean;
  level: number;
  moveCount: number;
  coinsEarned: number;
  onNextLevel: () => void;
}

export function WinModal({ visible, level, moveCount, coinsEarned, onNextLevel }: WinModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="win-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="win-modal"
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
          >
            <div className="win-modal-glow win-modal-glow--blue" aria-hidden="true" />
            <div className="win-modal-glow win-modal-glow--gold" aria-hidden="true" />

            <div className="win-hero">
              <motion.div
                className="win-badge"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18 }}
              >
                <Sparkles className="win-badge-icon" aria-hidden="true" />
                <span>Level Cleared</span>
              </motion.div>

              <motion.div
                className="win-celebration"
                animate={{ rotate: [0, -6, 6, -3, 3, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="win-celebration-core">
                  <Trophy className="win-celebration-icon" aria-hidden="true" />
                </div>
              </motion.div>
            </div>

            <h2 className="win-title">Level {level} Complete!</h2>
            <p className="win-stats">
              Solved in <span className="win-stats-highlight">{moveCount}</span> moves
            </p>

            <motion.div
              className="win-reward"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.4 }}
            >
              <span className="win-reward-icon-wrap" aria-hidden="true">
                <Coins className="win-reward-icon" />
              </span>
              <span className="win-reward-copy">
                <span className="win-reward-label">Reward</span>
                <span className="win-reward-value">+{coinsEarned}</span>
              </span>
            </motion.div>

            <button className="win-btn" onClick={onNextLevel}>
              <span className="win-btn-icon" aria-hidden="true">
                <ArrowRight />
              </span>
              <span>Next Level</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
