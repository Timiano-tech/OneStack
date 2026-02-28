import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiSettings, FiLogOut, FiZap } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { ListingCard } from '../components/ListingCard';
import type { User, Listing } from '../types';

const MOCK_USER: User = {
  id: 'u1',
  email: 'alex@university.edu',
  displayName: 'Alex Chen',
  photoURL: '',
  universityId: 'uni1',
  campusId: 'c1',
  isVerifiedStudent: true,
  trustScore: 4.8,
  createdAt: new Date().toISOString(),
  role: 'user',
};

const MOCK_MY_LISTINGS: Listing[] = [
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
];

const MOCK_FAVORITES: Listing[] = [];

export function Profile() {
  const [user] = useState<User>(MOCK_USER);
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites'>('listings');
  const [isLoggedIn] = useState(true); // TODO: from auth

  if (!isLoggedIn) {
    return (
      <AnimatedPage className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Profile</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Sign in to view your profile and listings.
          </p>
          <Link to="/login" className="mt-4 inline-block">
            <Button>Sign in</Button>
          </Link>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500">
                  {user.displayName[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {user.displayName}
                </h1>
                {user.isVerifiedStudent && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                <FiStar size={16} />
                {user.trustScore} seller rating
              </p>
            </div>
            <Link to="/profile/settings">
              <Button variant="ghost" leftIcon={FiSettings} aria-label="Settings">
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <Link
          to="/pricing"
          className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
            <FiZap size={18} />
            Upgrade to Premium — unlimited listings & boosts
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400">→</span>
        </Link>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
              activeTab === 'listings'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            My listings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            Favorites
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'listings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                  Your listings
                </h2>
                <Link to="/listing/create">
                  <Button size="sm">New listing</Button>
                </Link>
              </div>
              {MOCK_MY_LISTINGS.length === 0 ? (
                <p className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No listings yet. Create one to start selling.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {MOCK_MY_LISTINGS.map((listing, i) => (
                    <ListingCard key={listing.id} listing={listing} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'favorites' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                Saved items
              </h2>
              {MOCK_FAVORITES.length === 0 ? (
                <p className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No favorites yet. Browse listings and tap the heart to save.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {MOCK_FAVORITES.map((listing, i) => (
                    <ListingCard key={listing.id} listing={listing} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="mt-8">
          <Button variant="ghost" fullWidth leftIcon={FiLogOut} className="text-red-600">
            Sign out
          </Button>
        </div>
      </div>
    </AnimatedPage>
  );
}
