import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiMapPin, FiGrid, FiPlus } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { CreatePost } from '../components/Feed/CreatePost';
import { PostCard } from '../components/Feed/PostCard';
import { getFeedPosts } from '../services/feedService';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types';
import { Button } from '../components/Button';

type FeedTab = 'campus' | 'trending' | 'categories';

// Temporary mock authors for Feed display testing
const mockAuthorsMap: Record<string, any> = {
  'u123': { displayName: 'Jane Doe', photoURL: 'https://i.pravatar.cc/150?u=u123', isVerifiedStudent: true },
};

export function Feed() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('campus');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchPosts = useCallback(async (reset = false) => {
    // Note: for Sugabase migration, we might need a public user profile fetch here
    // But for now let's stick to the feed fetch
    try {
      if (reset) {
        setLoading(true);
      }
      
      const pageToFetch = reset ? 0 : currentPage;
      
      const result = await getFeedPosts({
        campusId: activeTab === 'campus' ? (user as any)?.campusId : undefined,
        category: activeTab === 'categories' ? activeCategory : undefined,
        isTrending: activeTab === 'trending',
        lastPage: pageToFetch,
      });

      setPosts(prev => reset ? result.posts : [...prev, ...result.posts]);
      setCurrentPage(result.nextPage ?? 0);
      setHasMore(result.nextPage !== null);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeCategory, user, currentPage]);

  useEffect(() => {
    fetchPosts(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeCategory]); // Removed 'user' to avoid fetch loop if user object changes slightly

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 100;
    if (bottom && !loading && hasMore) {
      fetchPosts();
    }
  };

  const tabs = [
    { id: 'campus', label: 'Campus', icon: FiMapPin },
    { id: 'trending', label: 'Trending', icon: FiTrendingUp },
    { id: 'categories', label: 'Categories', icon: FiGrid },
  ] as const;

  const categories = ['All', 'Marketplace', 'Services', 'Deals', 'Jobs', 'Announcements', 'General'];

  return (
    <AnimatedPage className="flex h-[calc(100vh-3.5rem)] flex-col bg-slate-50 dark:bg-slate-900 md:h-[calc(100vh-3.5rem)]">
      
      {/* Header & Tabs */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800/95">
        <div className="mx-auto flex max-w-2xl flex-col px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Social Feed</h1>
            <Button 
              size="sm" 
              leftIcon={FiPlus} 
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#D60000] text-white hover:bg-[#b00000]"
            >
              Post
            </Button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FeedTab)}
                  className={`relative flex items-center gap-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'text-[#D60000]' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <tab.icon size={16} className={isActive ? 'text-[#D60000]' : ''} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="feedTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#D60000]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeTab === 'categories' && (
        <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800">
          <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === c
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Feed Content */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 pb-20 md:pb-6"
        onScroll={handleScroll}
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-4 relative">
          
          <AnimatePresence>
            {isCreateOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="mb-2"
              >
                <CreatePost 
                  onClose={() => setIsCreateOpen(false)} 
                  onSuccess={() => fetchPosts(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              authorsMap={mockAuthorsMap} // Mock for now
              onLikeChange={(id, count) => {
                setPosts(prev => prev.map(p => p.id === id ? { ...p, likeCount: count } : p));
              }}
              onSaveChange={(id, count) => {
                setPosts(prev => prev.map(p => p.id === id ? { ...p, saveCount: count } : p));
              }}
            />
          ))}

          {loading && (
            <div className="flex justify-center p-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#D60000]" />
            </div>
          )}
          
          {!loading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <FiGrid size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No posts yet</h3>
              <p className="mt-1 text-sm">Be the first to share something on campus!</p>
              {!isCreateOpen && (
                <Button onClick={() => setIsCreateOpen(true)} className="mt-4 bg-[#D60000] hover:bg-[#b00000]">
                  Create a Post
                </Button>
              )}
            </div>
          )}

          {!loading && !hasMore && posts.length > 0 && (
            <p className="py-6 text-center text-sm font-medium text-slate-400">
              You've caught up on all posts.
            </p>
          )}

        </div>
      </div>
    </AnimatedPage>
  );
}
