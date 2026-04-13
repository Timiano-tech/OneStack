'use client';
import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl w-fit"
      style={{ background: 'var(--surface-elevated)', borderRadius: '18px 18px 18px 4px' }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full typing-dot"
          style={{ background: 'var(--text-muted)' }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
