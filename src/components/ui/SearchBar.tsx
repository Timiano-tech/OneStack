'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiTrendingUp, FiPackage, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { globalSearch, debounce } from '../../services/searchService';
import type { SearchResults } from '@/types';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setFocused(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) { setResults(null); setLoading(false); return; }
      setLoading(true);
      try {
        const res = await globalSearch(q);
        setResults(res);
      } catch { setResults(null); }
      finally { setLoading(false); }
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    doSearch(v);
  };

  const handleGoToSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setFocused(false);
    setQuery('');
  };

  const hasResults = results && (
    results.posts.length || results.listings.length || results.users.length
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <motion.div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: 'var(--surface-elevated)',
          border: `1px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.12)' : undefined,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        animate={{ width: focused ? '100%' : undefined }}
      >
        <FiSearch size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleGoToSearch()}
          placeholder="Search..."
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: 'var(--text)' }}
        />
        {query ? (
          <button onClick={() => { setQuery(''); setResults(null); }} style={{ color: 'var(--text-muted)' }}>
            <FiX size={15} />
          </button>
        ) : (
          <kbd className="hidden rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex"
            style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
            ⌘K
          </kbd>
        )}
      </motion.div>

      {/* Results dropdown */}
      <AnimatePresence>
        {focused && (query.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl shadow-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
          >
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2"
                  style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
              </div>
            ) : !hasResults ? (
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No results for "<strong>{query}</strong>"
                </p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                {results!.users.slice(0, 3).map((u) => (
                  <button key={u.id}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-elevated)]"
                    onClick={() => { router.push(`/profile/${u.id}`); setFocused(false); setQuery(''); }}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'var(--primary-muted)' }}>
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                        : <FiUser size={16} style={{ color: 'var(--primary)' }} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.fullName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Person</p>
                    </div>
                  </button>
                ))}
                {results!.listings.slice(0, 3).map((l) => (
                  <button key={l.id}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-elevated)]"
                    onClick={() => { router.push(`/listing/${l.id}`); setFocused(false); setQuery(''); }}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                      style={{ background: 'var(--surface-elevated)' }}>
                      {l.images?.[0]
                        ? <img src={l.images[0]} alt="" className="h-full w-full object-cover" />
                        : <FiPackage size={16} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text)' }}>{l.title}</p>
                      <p className="text-xs" style={{ color: 'var(--secondary)' }}>
                        {l.currency} {l.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
                {results!.posts.slice(0, 2).map((p) => (
                  <button key={p.id}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-elevated)]"
                    onClick={() => { router.push(`/feed/post/${p.id}`); setFocused(false); setQuery(''); }}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: 'var(--surface-elevated)' }}>
                      <FiTrendingUp size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text)' }}>
                        {p.content.substring(0, 60)}...
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Post</p>
                    </div>
                  </button>
                ))}

                {/* See all */}
                <button
                  className="w-full py-3 text-sm font-medium transition-colors hover:bg-[var(--surface-elevated)]"
                  style={{ color: 'var(--primary)' }}
                  onClick={handleGoToSearch}
                >
                  See all results for "{query}" →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
