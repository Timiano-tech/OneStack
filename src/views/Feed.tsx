'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiMapPin, FiGrid, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { CreatePost } from '../components/Feed/CreatePost';
import { PostCard } from '../components/Feed/PostCard';
import { StoryReel } from '../components/Feed/StoryReel';
import { PostCardSkeleton, StoryReelSkeleton } from '../components/ui/SkeletonLoader';
import { useAuth } from '../contexts/AuthContext';
import { useFeed } from '../hooks/useFeed';
import { useQueryClient } from '@tanstack/react-query';
import type { Post } from '../types';
import { containerVariants, itemVariants } from '../lib/animations';

type FeedTab = 'campus' | 'trending' | 'categories';

export function Feed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FeedTab>('campus');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch
  } = useFeed(activeTab, activeCategory);

  const posts = data?.pages.flatMap(p => p.posts) || [];
  const loading = isFetching && !isFetchingNextPage;
  const hasMore = hasNextPage;
  const refreshing = isFetching && !isFetchingNextPage && posts.length > 0;

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 150;
    if (bottom && !isFetchingNextPage && hasNextPage) fetchNextPage();
  };

  // Pull to refresh
  let startY = 0;
  const handleTouchStart = (e: React.TouchEvent) => { startY = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 80 && !isFetching) {
      refetch();
    }
  };

  const tabs = [
    { id: 'campus', label: 'Campus', icon: FiMapPin },
    { id: 'trending', label: 'Trending', icon: FiTrendingUp },
    { id: 'categories', label: 'Categories', icon: FiGrid },
  ] as const;

  const categories = ['All', 'Marketplace', 'Services', 'Deals', 'Jobs', 'Announcements', 'General'];

  return (
    <AnimatedPage className="flex h-[calc(100dvh-3.5rem)] flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header & Tabs */}
      <div className="glass-nav sticky top-0 z-30">
        <div className="mx-auto flex max-w-2xl flex-col px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Social Feed</h1>
            <motion.button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-white"
              style={{ background: 'var(--primary)', boxShadow: 'var(--shadow-blue)' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiPlus size={15} />
              Post
            </motion.button>
          </div>

          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FeedTab)}
                  className="relative flex items-center gap-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                  <tab.icon size={15} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="feedTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                      style={{ background: 'var(--primary)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category pills */}
      {activeTab === 'categories' && (
        <div className="border-b px-4 py-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className="rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeCategory === c ? 'var(--primary)' : 'var(--surface-elevated)',
                  color: activeCategory === c ? 'white' : 'var(--text-secondary)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feed content */}
      <div
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to refresh indicator */}
        <AnimatePresence>
          {refreshing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 48, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-center overflow-hidden"
              style={{ color: 'var(--primary)' }}
            >
              <FiRefreshCw size={20} className="ptr-spinner" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stories */}
        <StoryReel />

        {/* Post composer */}
        <div className="px-4 pt-4">
          <div className="mx-auto max-w-2xl">
            <AnimatePresence>
              {isCreateOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.97 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.97 }}
                  className="mb-4"
                >
                  <CreatePost
                    onClose={() => setIsCreateOpen(false)}
                    onSuccess={() => refetch()}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts */}
            {loading ? (
              <div className="space-y-4 pb-24">
                {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4 pb-24"
              >
                {posts.map(post => (
                  <motion.div key={post.id} variants={itemVariants}>
                    <PostCard
                      post={post}
                      onLikeChange={(id, count) => {
                        queryClient.setQueryData(['feed', activeTab, activeCategory, (user as any)?.campusId], (oldData: any) => {
                          if (!oldData) return oldData;
                          return {
                            ...oldData,
                            pages: oldData.pages.map((page: any) => ({
                              ...page,
                              posts: page.posts.map((p: any) => p.id === id ? { ...p, likeCount: count } : p)
                            }))
                          };
                        });
                      }}
                      onSaveChange={(id, count) => {
                        queryClient.setQueryData(['feed', activeTab, activeCategory, (user as any)?.campusId], (oldData: any) => {
                          if (!oldData) return oldData;
                          return {
                            ...oldData,
                            pages: oldData.pages.map((page: any) => ({
                              ...page,
                              posts: page.posts.map((p: any) => p.id === id ? { ...p, saveCount: count } : p)
                            }))
                          };
                        });
                      }}
                    />
                  </motion.div>
                ))}

                {!loading && posts.length === 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center py-16 text-center"
                  >
                    <div className="mb-4 text-5xl">📣</div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                      Nothing here yet
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      Be the first to share something on campus!
                    </p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      Create a Post
                    </button>
                  </motion.div>
                )}

                {!loading && !hasMore && posts.length > 0 && (
                  <p className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    You've seen it all! 🎉
                  </p>
                )}

                {/* Infinite scroll loader */}
                {!loading && hasMore && posts.length > 0 && (
                  <div className="flex justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2"
                      style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
