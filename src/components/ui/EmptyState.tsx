'use client';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { IconType } from 'react-icons';

interface EmptyStateProps {
  icon?: string | IconType;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  illustration?: 'search' | 'feed' | 'chat' | 'default';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  illustration = 'default',
}: EmptyStateProps) {
  
  const illustrations = {
    search: '🔍',
    feed: '📣',
    chat: '💬',
    default: '✨'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
        style={{ background: 'var(--surface-elevated)' }}>
        {typeof Icon === 'string' || !Icon ? (
           <span className="text-5xl">{illustrations[illustration] || '✨'}</span>
        ) : (
          <Icon size={40} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>
      
      <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      
      {description && (
        <p className="mt-2 max-w-xs text-sm" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      
      {actionText && onAction && (
        <div className="mt-8">
          <Button onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
