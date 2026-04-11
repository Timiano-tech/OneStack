import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Input } from '../components/Input';
import { ListingCard } from '../components/ListingCard';
import { Button } from '../components/Button';
import { LISTING_CATEGORIES, SERVICE_CATEGORIES, type Listing } from '../types';
import { getListings } from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';

const ALL_CATEGORIES = [...LISTING_CATEGORIES, ...SERVICE_CATEGORIES];

export function Listings() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [category, setCategory] = useState(searchParams?.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, query, user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const sortedListings = useMemo(() => {
    const list = [...listings];
    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [listings, sortBy]);

  const applyFilters = () => {
    const next = new URLSearchParams(Array.from(searchParams?.entries() || []));
    if (query) next.set('q', query);
    else next.delete('q');
    if (category) next.set('category', category);
    else next.delete('category');
    router.replace(`${pathname}?${next.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setSortBy('newest');
    router.replace(pathname || ' /listings');
    setShowFilters(false);
  };

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="sticky top-14 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:top-16">
        <div className="mx-auto flex max-w-7xl gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search listings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={FiSearch}
              className="bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={FiSliders}
          >
            Filters
          </Button>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-3 overflow-hidden border-t border-slate-200 pt-3 dark:border-slate-700"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">All</option>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={FiX}>
                  Clear
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Apply
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {sortedListings.length} listing{sortedListings.length !== 1 ? 's' : ''}
        </p>
        
        {loading ? (
           <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
           </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {sortedListings.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  No listings match your filters. Try adjusting your search.
                </motion.p>
              ) : (
                sortedListings.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i} />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
