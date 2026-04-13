'use client';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from '../../utils/dateUtils';
import type { Notification } from '../../types';

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

const TYPE_ICONS: Record<string, string> = {
  like: '❤️',
  comment: '💬',
  follow: '👥',
  message: '💌',
  listing_sold: '🎉',
  price_drop: '📉',
  mention: '📢',
  welcome: '🎊',
  announcement: '📣',
};

export function NotificationItem({ notification: n, onClick }: NotificationItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: 'var(--surface-elevated)' }}
      className="flex cursor-pointer gap-3 px-4 py-4 transition-colors"
      style={{ background: !n.readAt ? 'var(--primary-muted)' : 'transparent' }}
      onClick={() => onClick?.(n)}
    >
      {/* Actor avatar or emoji icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl shadow-sm"
        style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
        {n.actor?.avatarUrl ? (
          <img src={n.actor.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span>{TYPE_ICONS[n.type] || '🔔'}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>
          {n.actor && (
            <span className="font-semibold">{n.actor.fullName} </span>
          )}
          {n.message}
        </p>
        <p className="mt-1 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {formatDistanceToNow(n.createdAt)}
        </p>
      </div>

      {/* Unread indicator */}
      {!n.readAt && (
        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
      )}
    </motion.div>
  );
}
