'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSliders, FiX, FiGrid, FiList } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { ListingCard } from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/ui/SkeletonLoader';
import { LISTING_CATEGORIES, SERVICE_CATEGORIES, type Listing } from '../types';
import { getListings } from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import { containerVariants, itemVariants } from '../lib/animations';

const ALL_CATEGORIES = [...LISTING_CATEGORIES, ...SERVICE_CATEGORIES];
const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'for_parts'] as const;

export function Listings() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [category, setCategory] = useState(searchParams?.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [viewGrid, setViewGrid] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getListings({
        category: category || undefined,
        query: query || undefined,
        campusId: (user as any)?.campusId,
      });
      setListings(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [category, query, user]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const sortedListings = useMemo(() => {
    let list = [...listings];
    if (condition) list = list.filter(l => l.condition === condition);
    if (minPrice) list = list.filter(l => l.price >= parseFloat(minPrice));
    if (maxPrice) list = list.filter(l => l.price <= parseFloat(maxPrice));
    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [listings, sortBy, condition, minPrice, maxPrice]);

  const clearFilters = () => {
    setQuery(''); setCategory(''); setSortBy('newest');
    setCondition(''); setMinPrice(''); setMaxPrice('');
    setShowFilters(false);
    router.replace(pathname || '/listings');
  };

  const activeFilterCount = [category, condition, minPrice, maxPrice].filter(Boolean).length;

  return (
    <AnimatedPage className="min-h-screen" style={{ background: 'var(--bg)' }}>
      
      {/* Sticky search bar */}
      <div className="glass-nav sticky top-14 z-30 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-7xl gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search listings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}>
                <FiX size={15} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'var(--surface-elevated)' }}>
            <button onClick={() => setViewGrid(true)}
              className="rounded-lg p-2 transition-colors"
              style={{ background: viewGrid ? 'var(--primary)' : 'transparent', color: viewGrid ? 'white' : 'var(--text-muted)' }}>
              <FiGrid size={15} />
            </button>
            <button onClick={() => setViewGrid(false)}
              className="rounded-lg p-2 transition-colors"
              style={{ background: !viewGrid ? 'var(--primary)' : 'transparent', color: !viewGrid ? 'white' : 'var(--text-muted)' }}>
              <FiList size={15} />
            </button>
          </div>

          {/* Filters button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            style={{
              background: showFilters ? 'var(--primary)' : 'var(--surface-elevated)',
              color: showFilters ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <FiSliders size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: '#ef4444' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-auto max-w-7xl overflow-hidden"
            >
              <div className="mt-3 space-y-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                {/* Category */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium self-center" style={{ color: 'var(--text-muted)' }}>Category:</span>
                  <button onClick={() => setCategory('')}
                    className="rounded-full px-3 py-1 text-xs transition-colors"
                    style={{ background: !category ? 'var(--primary)' : 'var(--surface-elevated)', color: !category ? 'white' : 'var(--text-secondary)' }}>
                    All
                  </button>
                  {ALL_CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(category === c ? '' : c)}
                      className="rounded-full px-3 py-1 text-xs transition-colors"
                      style={{ background: category === c ? 'var(--primary)' : 'var(--surface-elevated)', color: category === c ? 'white' : 'var(--text-secondary)' }}>
                      {c}
                    </button>
                  ))}
                </div>

                {/* Condition chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium self-center" style={{ color: 'var(--text-muted)' }}>Condition:</span>
                  {CONDITIONS.map(c => (
                    <button key={c} onClick={() => setCondition(condition === c ? '' : c)}
                      className="rounded-full px-3 py-1 text-xs transition-colors capitalize"
                      style={{ background: condition === c ? 'var(--primary)' : 'var(--surface-elevated)', color: condition === c ? 'white' : 'var(--text-secondary)' }}>
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Price range & sort */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min ₦" value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      className="w-24 rounded-xl border px-3 py-1.5 text-sm outline-none"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--text)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                    <input type="number" placeholder="Max ₦" value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      className="w-24 rounded-xl border px-3 py-1.5 text-sm outline-none"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--text)' }} />
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="rounded-xl border px-3 py-1.5 text-sm outline-none"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--text)' }}>
                    <option value="newest">Newest first</option>
                    <option value="price_asc">Price: low → high</option>
                    <option value="price_desc">Price: high → low</option>
                  </select>
                  <button onClick={clearFilters}
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{ color: '#ef4444' }}>
                    <FiX size={14} /> Clear all
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-5 pb-24">
        <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          {sortedListings.length} listing{sortedListings.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 ? ' (filtered)' : ''}
        </p>

        {loading ? (
          <div className={viewGrid ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
            {[...Array(6)].map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              No listings found
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your filters or search term
            </p>
            <button onClick={clearFilters}
              className="mt-4 rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ background: 'var(--primary)' }}>
              Clear filters
            </button>
          </div>
        ) : viewGrid ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sortedListings.map((listing, i) => (
              <motion.div key={listing.id} variants={itemVariants}>
                <ListingCard listing={listing} index={i} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {sortedListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                variants={itemVariants}
                className="flex gap-4 rounded-2xl p-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={listing.images?.[0] || '/placeholder-listing.jpg'}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {listing.title}
                  </h3>
                  <p className="font-bold" style={{ color: 'var(--primary)' }}>
                    {listing.currency} {listing.price.toLocaleString()}
                  </p>
                  <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                    {listing.location} · {listing.category}
                  </p>
                  {listing.condition && (
                    <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize" style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
                      {listing.condition.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
}
