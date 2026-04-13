'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiCamera, FiMapPin, FiCalendar, FiStar, FiEdit2 } from 'react-icons/fi';
import type { User } from '../../types';

interface ProfileHeaderProps {
  user: User;
  isOwn?: boolean;
  followerCount?: number;
  followingCount?: number;
  listingCount?: number;
  onEditClick?: () => void;
  onCoverUpload?: (file: File) => void;
  onAvatarUpload?: (file: File) => void;
  followButton?: React.ReactNode;
}

export function ProfileHeader({
  user,
  isOwn = false,
  followerCount = 0,
  followingCount = 0,
  listingCount = 0,
  onEditClick,
  onCoverUpload,
  onAvatarUpload,
  followButton,
}: ProfileHeaderProps) {
  const coverRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 300], [0, 80]);
  const coverOpacity = useTransform(scrollY, [0, 200], [1, 0.6]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCoverUpload) onCoverUpload(file);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) onAvatarUpload(file);
  };

  const tierColors = {
    pro: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    business: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    free: undefined,
  };

  return (
    <div className="relative" style={{ background: 'var(--surface)' }}>
      {/* Cover photo with parallax */}
      <div ref={coverRef} className="relative h-44 overflow-hidden sm:h-56">
        <motion.div
          style={{ y: coverY, opacity: coverOpacity }}
          className="parallax-cover absolute inset-0"
        >
          {user.coverUrl ? (
            <img src={user.coverUrl} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
              }}
            />
          )}
        </motion.div>

        {/* Edit cover */}
        {isOwn && (
          <label className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
            <FiCamera size={14} />
            Edit cover
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </label>
        )}
      </div>

      {/* Avatar + info row */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between">
          {/* Avatar */}
          <div className="relative -mt-12 shrink-0">
            <div
              className="h-[88px] w-[88px] overflow-hidden rounded-2xl"
              style={{
                border: '3px solid var(--surface)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-3xl font-bold text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            {isOwn && (
              <label className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white shadow-md"
                style={{ background: 'var(--primary)' }}>
                <FiCamera size={13} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
            {/* Premium badge */}
            {user.subscriptionTier && user.subscriptionTier !== 'free' && (
              <div
                className="absolute -top-1.5 -right-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow"
                style={{ background: tierColors[user.subscriptionTier] }}
              >
                {user.subscriptionTier}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pb-1">
            {isOwn ? (
              <button
                onClick={onEditClick}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: 'var(--surface-elevated)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                <FiEdit2 size={14} />
                Edit profile
              </button>
            ) : (
              followButton
            )}
          </div>
        </div>

        {/* Name & info */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {user.fullName}
            </h1>
            {user.isVerified && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
              >
                <FiStar size={10} fill="currentColor" />
                Verified Student
              </motion.span>
            )}
          </div>

          {user.bio && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {user.major && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                📚 {user.major}
              </span>
            )}
            {user.graduationYear && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <FiCalendar size={12} /> Class of {user.graduationYear}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <FiMapPin size={12} /> Campus
            </span>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 pt-2">
            {[
              { label: 'Followers', value: followerCount },
              { label: 'Following', value: followingCount },
              { label: 'Listings', value: listingCount },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-base font-bold" style={{ color: 'var(--text)' }}>
                  {value}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-bold" style={{ color: 'var(--text)' }}>
                {user.trustScore.toFixed(1)}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                ⭐ Rating
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
