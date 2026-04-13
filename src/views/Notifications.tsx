'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedPage } from '../components/AnimatedPage';
import { NotificationItemSkeleton } from '../components/ui/SkeletonLoader';
import { getNotifications, markAllRead, markAsRead } from '../services/notificationService';
import type { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../utils/dateUtils';
import { containerVariants, itemVariants } from '../lib/animations';

const TYPE_ICONS: Record<string, string> = {
  like: '❤️', comment: '💬', follow: '👥', message: '💌',
  listing_sold: '🎉', price_drop: '📉', mention: '📢',
  welcome: '🎊', announcement: '📣',
};

type FilterTab = 'all' | 'likes' | 'comments' | 'follows' | 'messages';

export function Notification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    if (!user) return;
    getNotifications(user.id, 50)
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
  };

  const handleMarkRead = async (n: Notification) => {
    if (n.readAt) return;
    await markAsRead(n.id);
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x));
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'likes') return n.type === 'like';
    if (activeTab === 'comments') return n.type === 'comment' || n.type === 'mention';
    if (activeTab === 'follows') return n.type === 'follow';
    if (activeTab === 'messages') return n.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'likes', label: 'Likes' },
    { id: 'comments', label: 'Comments' },
    { id: 'follows', label: 'Follows' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <AnimatedPage className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="glass-nav sticky top-14 z-30 border-b px-4 py-3"
        style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                  style={{ background: 'var(--primary)' }}>
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-sm font-medium"
              style={{ color: 'var(--primary)' }}>
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mx-auto mt-3 flex max-w-2xl gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface-elevated)',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl pb-24">
        {loading ? (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {[...Array(8)].map((_, i) => <NotificationItemSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              No {activeTab !== 'all' ? activeTab : ''} notifications
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              You're all caught up!
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y"
            style={{ borderColor: 'var(--border)' }}
          >
            {filtered.map(n => (
              <motion.div
                key={n.id}
                variants={itemVariants}
                onClick={() => handleMarkRead(n)}
                className="flex cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-[var(--surface-elevated)]"
                style={{ background: !n.readAt ? 'var(--primary-muted)' : undefined }}
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                  style={{ background: 'var(--surface-elevated)' }}>
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
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(n.createdAt)}
                  </p>
                </div>

                {!n.readAt && (
                  <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: 'var(--primary)' }} />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
}
