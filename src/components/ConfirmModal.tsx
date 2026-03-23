import { AnimatePresence, motion } from 'framer-motion';
import './ConfirmModal.css';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Reset',
  cancelLabel = 'Cancel',
  icon = '⚠️',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="confirm-modal"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">{icon}</div>
            <h2 className="confirm-title">{title}</h2>
            <p className="confirm-message">{message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn--cancel" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button className="confirm-btn confirm-btn--danger" onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
