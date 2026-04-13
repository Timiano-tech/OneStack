'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getNotifications, getUnreadCount, markAllRead, markAsRead } from '../../services/notificationService';
import { subscribeToNotifications } from '../../services/notificationService';
import type { Notification } from '../../types';
import { notificationBellVariant, notificationSlideIn } from '../../lib/animations';
import { formatDistanceToNow } from '../../utils/dateUtils';

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [ringing, setRinging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.id, 20).then(setNotifications).catch(console.error);
    getUnreadCount(user.id).then(setUnread).catch(console.error);

    const channel = subscribeToNotifications(user.id, (notif) => {
      setNotifications((prev) => [notif, ...prev.slice(0, 29)]);
      setUnread((n) => n + 1);
      // Ring the bell
      setRinging(true);
      setTimeout(() => setRinging(false), 800);
    });

    return () => { channel?.unsubscribe?.(); };
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  const handleMarkRead = async (n: Notification) => {
    if (n.readAt) return;
    await markAsRead(n.id).catch(console.error);
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))
    );
    setUnread((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllRead(user.id).catch(console.error);
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    setUnread(0);
  };

  const notifIcon: Record<string, string> = {
    like: '❤️', comment: '💬', follow: '👥', message: '💌',
    listing_sold: '🎉', price_drop: '📉', mention: '📢',
    welcome: '🎊', announcement: '📣',
  };

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
        style={{
          background: open ? 'var(--primary-muted)' : 'transparent',
          color: open ? 'var(--primary)' : 'var(--text-secondary)',
        }}
        animate={ringing ? 'ring' : 'idle'}
        variants={notificationBellVariant}
        aria-label="Notifications"
      >
        <FiBell size={22} />
        {unread > 0 && (
          <motion.span
            className="badge-pulse absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: '#ef4444' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={notificationSlideIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute right-0 top-12 z-50 w-80 max-h-[480px] overflow-y-auto rounded-2xl shadow-xl"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Notifications
              </span>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium"
                  style={{ color: 'var(--primary)' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Items */}
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="text-3xl">🔔</span>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--surface-elevated)]"
                    style={{ background: !n.readAt ? 'var(--primary-muted)' : undefined }}
                    onClick={() => handleMarkRead(n)}
                  >
                    {/* Actor avatar or emoji */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
                      style={{ background: 'var(--surface-elevated)' }}>
                      {n.actor?.avatarUrl ? (
                        <img src={n.actor.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span>{notifIcon[n.type] || '🔔'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>
                        {n.actor && (
                          <span className="font-semibold">{n.actor.fullName} </span>
                        )}
                        {n.message}
                      </p>
                      <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {formatDistanceToNow(n.createdAt)}
                      </p>
                    </div>
                    {!n.readAt && (
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--primary)' }} />
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer */}
            <Link
              href="/notifications"
              className="block border-t py-3 text-center text-sm font-medium transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
