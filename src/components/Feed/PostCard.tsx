import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiMessageCircle, FiCheckCircle, FiMoreHorizontal, FiShare2, FiBookmark } from 'react-icons/fi';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
import { toggleLike, checkHasLiked, toggleSavePost, checkHasSaved } from '../../services/feedService';
import type { Post } from '../../types';
import { toast } from '../Toast';
import { LikeButton } from './LikeButton';
import { PremiumBadge } from '../premium/PremiumBadge';

interface PostCardProps {
  post: Post;
  onLikeChange?: (postId: string, newLikeCount: number, isLiked: boolean) => void;
  onSaveChange?: (postId: string, newSaveCount: number, isSaved: boolean) => void;
}

export const PostCard = React.memo(function PostCard({ post, onLikeChange, onSaveChange }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saveCount, setSaveCount] = useState(post.saveCount);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (user) {
      const checkStatus = async () => {
        try {
          const [liked, saved] = await Promise.all([
            checkHasLiked(post.id, user.id),
            checkHasSaved(post.id, user.id)
          ]);
          setIsLiked(liked);
          setIsSaved(saved);
        } catch (err) {
          console.error('Error checking post status', err);
        }
      };
      checkStatus();
    }
  }, [post.id, user]);

  const author = post.author || {
    fullName: 'Student',
    isVerified: true,
  };

  const handleLike = async () => {
    if (!user) {
      toast.info('Sign in to like posts');
      return;
    }

    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    
    setIsLiked(newLiked);
    setLikeCount(newCount);
    if (onLikeChange) onLikeChange(post.id, newCount, newLiked);

    try {
      const result = await toggleLike(post.id, user.id);
      if (result !== newLiked) {
        setIsLiked(result);
      }
    } catch (err) {
      setIsLiked(!newLiked);
      setLikeCount(likeCount);
      toast.error('Failed to like post.');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.info('Sign in to save posts');
      return;
    }

    const newSaved = !isSaved;
    const newCount = newSaved ? saveCount + 1 : Math.max(0, saveCount - 1);

    setIsSaved(newSaved);
    setSaveCount(newCount);
    if (onSaveChange) onSaveChange(post.id, newCount, newSaved);

    try {
      const result = await toggleSavePost(post.id, user.id);
      if (result !== newSaved) {
        setIsSaved(result);
      }
    } catch {
      setIsSaved(!newSaved);
      setSaveCount(saveCount);
      toast.error('Failed to save post.');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/feed/post/${post.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Post by ${author.fullName}`,
        text: post.content.substring(0, 100),
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="card flex flex-col rounded-2xl p-0 overflow-hidden" 
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link href={`/profile/${post.userId}`} className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full" style={{ background: 'var(--surface-elevated)' }}>
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={author.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white" 
                style={{ background: 'var(--primary)' }}>
                {author.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{author.fullName}</span>
              {author.isVerified && (
                <FiCheckCircle className="text-primary" size={13} title="Verified Student" />
              )}
              { (post as any).isPremium && <PremiumBadge tier="pro" size="sm" /> }
            </div>
            <div className="mt-1 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {post.category} • {formatDistanceToNow(post.createdAt)}
            </div>
          </div>
        </Link>
        <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-elevated)]"
          style={{ color: 'var(--text-muted)' }}>
          <FiMoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed" style={{ color: 'var(--text)' }}>
          {post.content}
        </p>
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <span key={tag} className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images - Instagram style carousel */}
      {post.images && post.images.length > 0 && (
        <div className="relative aspect-[4/5] sm:aspect-video w-full" style={{ background: '#000' }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIdx}
              src={post.images[currentImageIdx]}
              alt="Post"
              className="h-full w-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
          
          {post.images.length > 1 && (
            <>
              <div className="absolute top-3 right-3 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                {currentImageIdx + 1}/{post.images.length}
              </div>
              
              {/* Pagination dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {post.images.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImageIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={(e) => { e.preventDefault(); setCurrentImageIdx((i) => (i === 0 ? post.images.length - 1 : i - 1)); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setCurrentImageIdx((i) => (i === post.images.length - 1 ? 0 : i + 1)); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}

      {/* Footer / Interaction Bar */}
      <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-6">
          <LikeButton
            isLiked={isLiked}
            count={likeCount}
            onToggle={handleLike}
          />
          
          <Link
            href={`/feed/post/${post.id}`}
            className="flex items-center gap-1.5 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <FiMessageCircle size={20} />
            <span className="text-sm font-medium">{post.commentCount}</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <FiShare2 size={20} />
            { post.shareCount > 0 && <span className="text-sm font-medium">{post.shareCount}</span> }
          </button>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center transition-all"
          style={{ color: isSaved ? 'var(--secondary)' : 'var(--text-secondary)' }}
        >
          <motion.div whileTap={{ scale: 0.8 }} className="flex items-center gap-1.5">
            <FiBookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
            <span className="text-sm font-medium">{saveCount}</span>
          </motion.div>
        </button>
      </div>
    </div>
  );
});
