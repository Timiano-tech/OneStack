'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSearch, FiSliders, FiUsers, FiPackage, FiMessageCircle } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { PostCard } from '../components/Feed/PostCard';
import { ListingCard } from '../components/ListingCard';
import { PostCardSkeleton, ListingCardSkeleton, SearchResultSkeleton } from '../components/ui/SkeletonLoader';
import { globalSearch } from '../services/searchService';
import { containerVariants, itemVariants } from '../lib/animations';
import type { SearchResults, Post, Listing, User } from '../types';

type SearchTab = 'all' | 'listings' | 'posts' | 'people';

export function Search() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await globalSearch(q);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const TABS: { id: SearchTab; label: string; icon: any }[] = [
    { id: 'all', label: 'All', icon: FiSearch },
    { id: 'listings', label: 'Listings', icon: FiPackage },
    { id: 'posts', label: 'Posts', icon: FiMessageCircle },
    { id: 'people', label: 'People', icon: FiUsers },
  ];

  const isEmpty = results && !results.posts.length && !results.listings.length && !results.users.length;

  return (
    <AnimatedPage className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="glass-nav sticky top-14 z-30 border-b px-4 py-3"
        style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, listings, or posts..."
              className="w-full rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </form>

          <div className="mt-4 flex gap-6 overflow-x-auto no-scrollbar">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 pb-3 text-sm font-semibold whitespace-nowrap transition-colors"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {isActive && (
                    <motion.div layoutId="searchTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                      style={{ background: 'var(--primary)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
        {loading ? (
          <div className="space-y-6">
             {[...Array(4)].map((_, i) => <SearchResultSkeleton key={i} />)}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              No results for "{initialQuery}"
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Try different keywords or check your spelling
            </p>
          </div>
        ) : results ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* People Section */}
            {(activeTab === 'all' || activeTab === 'people') && results.users.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  People
                </h2>
                <div className="space-y-3">
                  {results.users.map(u => (
                    <motion.div key={u.id} variants={itemVariants}
                      className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-[var(--surface-elevated)]"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full" style={{ background: 'var(--primary)' }}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-white">
                            {(u.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{u.fullName}</p>
                        <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                          {u.major || 'Student'} · Class of {u.graduationYear || '20XX'}
                        </p>
                      </div>
                      <button className="rounded-xl px-4 py-1.5 text-xs font-bold text-white" 
                        style={{ background: 'var(--primary)' }}>
                        Profile
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Listings Section */}
            {(activeTab === 'all' || activeTab === 'listings') && results.listings.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Listings
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.listings.map((l, i) => (
                    <motion.div key={l.id} variants={itemVariants}>
                      <ListingCard listing={l} index={i} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Posts Section */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Posts
                </h2>
                <div className="space-y-4">
                  {results.posts.map(p => (
                    <motion.div key={p.id} variants={itemVariants}>
                      <PostCard post={p} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Search OneStack
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Find anything across the campus marketplace and feed
            </p>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
