'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { heartVariants } from '../../lib/animations';

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onToggle: () => void | Promise<void>;
  size?: 'sm' | 'md';
  showCount?: boolean;
  disabled?: boolean;
}

export function LikeButton({
  isLiked,
  count,
  onToggle,
  size = 'md',
  showCount = true,
  disabled = false,
}: LikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const iconSize = size === 'sm' ? 18 : 20;

  const handleClick = useCallback(async () => {
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(isLiked ? 20 : [20, 30, 20]);
    }

    await onToggle();

    setTimeout(() => setIsAnimating(false), 500);
  }, [disabled, isAnimating, isLiked, onToggle]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="relative flex items-center gap-1.5 transition-colors select-none"
      style={{
        color: isLiked ? '#ef4444' : 'var(--text-secondary)',
        cursor: disabled ? 'default' : 'pointer',
      }}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      {/* Burst particles */}
      <AnimatePresence>
        {isAnimating && isLiked && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  left: '50%',
                  top: '50%',
                  background: i % 2 === 0 ? '#ef4444' : '#f97316',
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos((i * 60 * Math.PI) / 180) * 24,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 24,
                  scale: 0,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Heart icon */}
      <motion.div
        animate={isAnimating ? (isLiked ? 'liked' : 'unliked') : 'unliked'}
        variants={heartVariants}
      >
        <FiHeart
          size={iconSize}
          fill={isLiked ? '#ef4444' : 'none'}
          stroke={isLiked ? '#ef4444' : 'currentColor'}
          strokeWidth={isLiked ? 0 : 2}
        />
      </motion.div>

      {showCount && (
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium min-w-[16px]"
          >
            {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
