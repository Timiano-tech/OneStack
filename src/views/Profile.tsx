'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLogOut, FiZap, FiGrid, FiList, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { ListingCard } from '../components/ListingCard';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { TrustScoreBadge } from '../components/profile/TrustScoreBadge';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { UpgradeModal } from '../components/premium/UpgradeModal';
import { ProfileHeaderSkeleton, ListingCardSkeleton } from '../components/ui/SkeletonLoader';
import type { User, Listing } from '../types';
import { toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { syncUserToSupabase, updateUserProfileImage } from '../services/userService';
import { getListings } from '../services/listingService';
import { getFollowerCount, getFollowingCount, isFollowing, follow, unfollow } from '../services/followService';
import { getUserReviews } from '../services/reviewService';
import { containerVariants, itemVariants } from '../lib/animations';

type ProfileTab = 'listings' | 'reviews';

export function Profile() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  // When used as /profile, userId is own user; when /profile/[userId] it could be someone else
  const profileUserId = (params?.userId as string) || authUser?.id;
  const isOwn = !params?.userId || params?.userId === authUser?.id;

  const [activeTab, setActiveTab] = useState<ProfileTab>('listings');
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [viewModeGrid, setViewModeGrid] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (!profileUserId) { setLoading(false); return; }
    const init = async () => {
      try {
        const userProfile = await syncUserToSupabase(authUser as any);
        setDbUser(userProfile);
        const [listings, followers, following, reviews_data] = await Promise.all([
          getListings({ userId: profileUserId } as any),
          getFollowerCount(profileUserId),
          getFollowingCount(profileUserId),
          getUserReviews(profileUserId),
        ]);
        setMyListings(listings);
        setFollowerCount(followers);
        setFollowingCount(following);
        setReviews(reviews_data);

        if (authUser && !isOwn) {
          const following_status = await isFollowing(authUser.id, profileUserId);
          setIsFollowingUser(following_status);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, [profileUserId, authUser, isOwn]);

  const handleFollowToggle = async () => {
    if (!authUser || !profileUserId) return;
    setFollowLoading(true);
    try {
      if (isFollowingUser) {
        await unfollow(authUser.id, profileUserId);
        setFollowerCount(c => c - 1);
        setIsFollowingUser(false);
      } else {
        await follow(authUser.id, profileUserId);
        setFollowerCount(c => c + 1);
        setIsFollowingUser(true);
      }
    } catch { toast.error('Failed to update follow'); }
    finally { setFollowLoading(false); }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!authUser) return;
    try {
      const url = await updateUserProfileImage(authUser as any, file);
      setDbUser(prev => prev ? { ...prev, avatarUrl: url } : null);
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed'); }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!authUser && !loading) {
    return (
      <AnimatedPage className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Profile</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to view your profile.
          </p>
          <Link href="/login" className="mt-4 inline-block">
            <Button>Sign in</Button>
          </Link>
        </div>
      </AnimatedPage>
    );
  }

  const displayUser: User = dbUser || {
    id: authUser?.id || '',
    fullName: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'User',
    avatarUrl: authUser?.user_metadata?.avatar_url || '',
    username: authUser?.user_metadata?.username || '',
    email: authUser?.email || '',
    isVerified: false,
    trustScore: 0,
    campusId: '',
    createdAt: '',
    updatedAt: '',
    bio: '',
    major: '',
    graduationYear: 0,
    isBanned: false,
    notificationPreferences: {
      push: true,
      email: true,
      likes: true,
      comments: true,
      follows: true,
      messages: true,
      marketplace: true,
    },
    privacySettings: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessagesFrom: 'everyone'
    },
    subscriptionTier: 'free'
  };

  const followButton = (
    <motion.button
      onClick={handleFollowToggle}
      disabled={followLoading}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      style={{ background: isFollowingUser ? 'var(--surface-elevated)' : 'var(--primary)', color: isFollowingUser ? 'var(--text)' : 'white', border: '1px solid var(--border)' }}
    >
      {isFollowingUser ? <><FiUserCheck size={15} /> Following</> : <><FiUserPlus size={15} /> Follow</>}
    </motion.button>
  );

  return (
    <AnimatedPage className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {loading ? (
        <ProfileHeaderSkeleton />
      ) : (
        <ProfileHeader
          user={displayUser}
          isOwn={isOwn}
          followerCount={followerCount}
          followingCount={followingCount}
          listingCount={myListings.length}
          onEditClick={() => setEditOpen(true)}
          onAvatarUpload={handleAvatarUpload}
          followButton={!isOwn ? followButton : undefined}
        />
      )}

      <div className="mx-auto max-w-3xl px-4 pb-8">
        {/* Trust score */}
        {!loading && (
          <div className="mt-3 flex items-center gap-2">
            <TrustScoreBadge score={displayUser.trustScore} reviewCount={reviews.length} />
          </div>
        )}

        {/* Upgrade banner (own profile, not premium) */}
        {isOwn && (!dbUser?.subscriptionTier || dbUser.subscriptionTier === 'free') && (
          <motion.button
            onClick={() => setUpgradeOpen(true)}
            className="mt-4 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(245,158,11,0.06))',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--secondary)' }}>
              <FiZap size={16} />
              Upgrade to Premium — unlimited listings & visibility boosts
            </span>
            <span className="text-xs" style={{ color: 'var(--secondary)' }}>→</span>
          </motion.button>
        )}

        {/* Tabs */}
        <div className="mt-5 flex items-center gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
          {[
            { id: 'listings', label: 'Listings' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className="relative pb-3 text-sm font-medium transition-colors"
              style={{ color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="profileTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: 'var(--primary)' }} />
              )}
            </button>
          ))}

          {/* Grid/List toggle for listings */}
          {activeTab === 'listings' && (
            <div className="ml-auto flex items-center gap-1 rounded-xl p-1" style={{ background: 'var(--surface-elevated)' }}>
              <button onClick={() => setViewModeGrid(true)}
                className="rounded-lg p-1.5 transition-colors"
                style={{ background: viewModeGrid ? 'var(--primary)' : 'transparent', color: viewModeGrid ? 'white' : 'var(--text-muted)' }}>
                <FiGrid size={14} />
              </button>
              <button onClick={() => setViewModeGrid(false)}
                className="rounded-lg p-1.5 transition-colors"
                style={{ background: !viewModeGrid ? 'var(--primary)' : 'transparent', color: !viewModeGrid ? 'white' : 'var(--text-muted)' }}>
                <FiList size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="mt-5">
          {activeTab === 'listings' && (
            loading ? (
              <div className={viewModeGrid ? 'grid gap-4 sm:grid-cols-2' : 'space-y-3'}>
                {[...Array(4)].map((_, i) => <ListingCardSkeleton key={i} />)}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className={viewModeGrid ? 'grid gap-4 sm:grid-cols-2' : 'space-y-3'}
              >
                {myListings.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <div className="text-4xl mb-3">🛍️</div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      No listings yet.
                      {isOwn && ' Create one to start selling!'}
                    </p>
                    {isOwn && (
                      <Link href="/listing/create">
                        <button className="mt-3 rounded-full px-4 py-2 text-sm font-medium text-white"
                          style={{ background: 'var(--primary)' }}>
                          Create listing
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  myListings.map((listing, i) => (
                    <motion.div key={listing.id} variants={itemVariants}>
                      <ListingCard listing={listing} index={i} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )
          )}

          {activeTab === 'reviews' && (
            reviews.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No reviews yet</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                {reviews.map((review: any) => (
                  <motion.div key={review.id} variants={itemVariants}
                    className="rounded-2xl p-4"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-9 w-9 rounded-full overflow-hidden shrink-0" style={{ background: 'var(--surface-elevated)' }}>
                        {review.reviewer?.avatarUrl
                          ? <img src={review.reviewer.avatarUrl} alt="" className="h-full w-full object-cover" />
                          : <div className="flex h-full w-full items-center justify-center font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
                              {review.reviewer?.fullName?.charAt(0) || '?'}
                            </div>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                          {review.reviewer?.fullName || 'Anonymous'}
                        </p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="text-xs">{s <= review.rating ? '⭐' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )
          )}
        </div>

        {/* Sign out (own profile) */}
        {isOwn && (
          <div className="mt-8">
            <Button variant="ghost" fullWidth leftIcon={FiLogOut} className="text-red-500" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => window.location.reload()}
        initialValues={{
          fullName: displayUser.fullName,
          bio: displayUser.bio,
          major: displayUser.major,
          graduationYear: displayUser.graduationYear,
        }}
      />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </AnimatedPage>
  );
}
