import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Input } from '../components/Input';
import { ListingCard } from '../components/ListingCard';
import { Button } from '../components/Button';
import { LISTING_CATEGORIES, SERVICE_CATEGORIES, type Listing } from '../types';

// Mock data
const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    userId: 'u1',
    type: 'sell',
    title: 'MacBook Pro 14" M3',
    description: 'Like new.',
    price: 1299,
    currency: 'USD',
    category: 'Electronics',
    condition: 'like_new',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    location: 'North Campus',
    campusId: 'c1',
    universityId: 'uni1',
    isPremium: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'u2',
    type: 'service',
    title: 'Math & Physics Tutoring',
    description: 'All levels.',
    price: 25,
    currency: 'USD',
    category: 'Tutoring',
    images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'],
    location: 'Central Library',
    campusId: 'c1',
    universityId: 'uni1',
    isPremium: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'u3',
    type: 'sell',
    title: 'IKEA Desk + Chair',
    description: 'Moving out.',
    price: 120,
    currency: 'USD',
    category: 'Furniture',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'],
    location: 'South Dorms',
    campusId: 'c1',
    universityId: 'uni1',
    isPremium: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: 'u4',
    type: 'sell',
    title: 'Calculus Textbook',
    description: 'Stewart 9th ed.',
    price: 45,
    currency: 'USD',
    category: 'Books',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'],
    location: 'East Hall',
    campusId: 'c1',
    universityId: 'uni1',
    isPremium: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const ALL_CATEGORIES = [...LISTING_CATEGORIES, ...SERVICE_CATEGORIES];

export function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const filtered = useMemo(() => {
    let list = [...MOCK_LISTINGS];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }
    if (category) {
      list = list.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }
    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [query, category, sortBy]);

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);
    if (query) next.set('q', query);
    else next.delete('q');
    if (category) next.set('category', category);
    else next.delete('category');
    setSearchParams(next);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setSortBy('newest');
    setSearchParams({});
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
          />
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
                    <option key={c} value={c.toLowerCase()}>
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
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400"
              >
                No listings match your filters. Try adjusting your search.
              </motion.p>
            ) : (
              filtered.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatedPage>
  );
}
