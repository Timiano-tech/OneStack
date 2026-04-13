'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiX, FiInfo } from 'react-icons/fi';
import { modalVariants, backdropVariants } from '../../lib/animations';

interface TrustScoreBadgeProps {
  score: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TrustScoreBadge({ score, reviewCount = 0, size = 'md' }: TrustScoreBadgeProps) {
  const [open, setOpen] = useState(false);

  const starSizes = { sm: 12, md: 14, lg: 16 };
  const starSize = starSizes[size];

  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  const getColor = (s: number) => {
    if (s >= 4.5) return '#10b981'; // green
    if (s >= 3.5) return '#2563eb'; // blue
    if (s >= 2.5) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const color = getColor(score);

  const ratingLabel = (s: number) => {
    if (s >= 4.5) return 'Excellent';
    if (s >= 3.5) return 'Good';
    if (s >= 2.5) return 'Average';
    if (s > 0) return 'Poor';
    return 'No ratings yet';
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 ${textSizes[size]} font-medium transition-opacity hover:opacity-80`}
        style={{ color }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={starSize}
            fill={score >= star ? color : 'none'}
            stroke={color}
          />
        ))}
        <span>{score > 0 ? score.toFixed(1) : '—'}</span>
        <FiInfo size={11} style={{ color: 'var(--text-muted)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                    Trust Score
                  </h3>
                  <button onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: 'var(--surface-elevated)' }}>
                    <FiX size={16} />
                  </button>
                </div>

                {/* Big score display */}
                <div className="flex flex-col items-center py-4">
                  <div className="text-5xl font-black" style={{ color }}>
                    {score > 0 ? score.toFixed(1) : '—'}
                  </div>
                  <p className="mt-1 text-sm font-semibold" style={{ color }}>
                    {ratingLabel(score)}
                  </p>
                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        size={24}
                        fill={score >= star ? color : 'none'}
                        stroke={color}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* How it works */}
                <div className="mt-4 rounded-xl p-4 space-y-2" style={{ background: 'var(--surface-elevated)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    How it works
                  </p>
                  {[
                    ['⭐ 4.5+', 'Excellent seller — highly trusted by the campus community'],
                    ['⭐ 3.5+', 'Good standing — reliable with minor issues'],
                    ['⭐ 2.5+', 'Average — some mixed reviews'],
                    ['⭐ below 2.5', 'Poor — exercise extra caution'],
                  ].map(([range, desc]) => (
                    <div key={range} className="flex gap-2">
                      <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)', minWidth: 60 }}>
                        {range}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Scores are recalculated automatically after each transaction review.
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
