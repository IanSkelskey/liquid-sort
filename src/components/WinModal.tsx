import { motion, AnimatePresence } from 'framer-motion';
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
            <motion.div
              className="win-emoji"
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              🎉
            </motion.div>
            <h2 className="win-title">Level {level} Complete!</h2>
            <p className="win-stats">Solved in {moveCount} moves</p>
            <motion.div
              className="win-reward"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.4 }}
            >
              <span className="reward-label">+{coinsEarned}</span>
              <span className="reward-icon">🪙</span>
            </motion.div>
            <button className="win-btn" onClick={onNextLevel}>
              Next Level →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
