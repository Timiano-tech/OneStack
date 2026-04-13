'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { reactionContainerVariants, reactionItemVariants } from '../../lib/animations';

const REACTIONS = ['👍', '❤️', '😮', '😢', '🔥', '😂'];

interface ReactionPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

export function ReactionPicker({ visible, onSelect, onClose, position = 'top' }: ReactionPickerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />
          
          <motion.div
            className="absolute z-50 flex items-center gap-1 rounded-full px-3 py-2 shadow-lg"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              [position === 'top' ? 'bottom' : 'top']: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: position === 'top' ? '8px' : undefined,
              marginTop: position === 'bottom' ? '8px' : undefined,
            }}
            variants={reactionContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {REACTIONS.map((emoji) => (
              <motion.button
                key={emoji}
                variants={reactionItemVariants}
                onClick={() => { onSelect(emoji); onClose(); }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                style={{ lineHeight: 1 }}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
