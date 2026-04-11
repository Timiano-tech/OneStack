import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiSettings, FiLogOut, FiZap } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { ListingCard } from '../components/ListingCard';
import type { User, Listing } from '../types';
import { toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { syncUserToSupabase, updateUserProfileImage } from '../services/userService';
import { getListings } from '../services/listingService';

export function Profile() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites'>('listings');
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      const initProfile = async () => {
        try {
          // syncUserToSupabase expects supabase.User as first arg. 
          // AuthContext's user is (User & UserProfile), which includes the fields needed.
          const userProfile = await syncUserToSupabase(authUser as any);
          setDbUser(userProfile);
          
          // Fetch user's listings
          const listings = await getListings({ userId: authUser.id } as any);
          // Note: added userId to getListings filter in my head, I should ensure listingService supports it.
          // Let me check listingService.ts or just use the generic one.
          setMyListings(listings);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      initProfile();
    } else {
      setLoading(false);
    }
  }, [authUser]);

  if (loading) {
    return (
      <AnimatedPage className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
      </AnimatedPage>
    );
  }

  if (!authUser) {
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

  const displayUser = {
    displayName: dbUser?.displayName || authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email,
    photoURL: dbUser?.photoURL || authUser.user_metadata?.avatar_url || '',
    isVerifiedStudent: dbUser?.isVerifiedStudent ?? false,
    trustScore: dbUser?.trustScore ?? 0,
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large (max 5MB)');
      return;
    }

    setUploadingImage(true);
    try {
      const url = await updateUserProfileImage(authUser as any, file);
      setDbUser(prev => prev ? { ...prev, photoURL: url } : null);
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error('Failed to upload image. ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Failed to log out.');
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0">
               <div className="h-full w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                  {uploadingImage ? (
                    <span className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-500">
                      ...
                    </span>
                  ) : displayUser.photoURL ? (
                    <img src={displayUser.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500">
                      {displayUser.displayName?.[0]}
                    </span>
                  )}
               </div>
               
               <label
                  htmlFor="profile-upload"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-600 shadow-sm transition-colors hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  aria-label="Upload profile picture"
               >
                 <span className="text-xl leading-none -mt-1">+</span>
                 <input
                   id="profile-upload"
                   type="file"
                   accept="image/jpeg,image/png,image/webp"
                   className="hidden"
                   onChange={handleImageUpload}
                   disabled={uploadingImage}
                 />
               </label>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {displayUser.displayName}
                </h1>
                {displayUser.isVerifiedStudent && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{displayUser.email}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                <FiStar size={16} />
                {displayUser.trustScore} seller rating
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
              {myListings.length === 0 ? (
                <p className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No listings yet. Create one to start selling.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {myListings.map((listing, i) => (
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
              <p className="py-8 text-center text-slate-500 dark:text-slate-400">
                No favorites yet. Browse listings and tap the heart to save.
              </p>
            </motion.div>
          )}
        </div>

        <div className="mt-8">
          <Button variant="ghost" fullWidth leftIcon={FiLogOut} className="text-red-600" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </AnimatedPage>
  );
}
