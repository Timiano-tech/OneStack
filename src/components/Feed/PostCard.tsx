import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, FiShield } from 'react-icons/fi';
import { formatDistanceToNow } from '../../utils/dateUtils';
import type { Post } from '../../types';
import { toast } from '../Toast';

interface PostCardProps {
  post: Post;
  authorsMap: Record<string, { displayName: string; photoURL?: string; isVerifiedStudent: boolean }>;
  onLikeChange?: (postId: string, newLikeCount: number, isLiked: boolean) => void;
  onSaveChange?: (postId: string, newSaveCount: number, isSaved: boolean) => void;
}

export function PostCard({ post, authorsMap, onLikeChange, onSaveChange }: PostCardProps) {
  // In a real app we'd fetch author details, user's like/save state in bulk. For now we mock local state.
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saveCount, setSaveCount] = useState(post.saveCount);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Fallback author if map not loaded yet
  const author = authorsMap[post.userId] || {
    displayName: 'Student',
    isVerifiedStudent: true,
  };

  const handleLike = async () => {
    // Optimistic UI
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    if (onLikeChange) onLikeChange(post.id, newLiked ? likeCount + 1 : likeCount - 1, newLiked);

    try {
      // Mock toggle
      // await toggleLike(post.id, currentUser.id);
    } catch {
      // Revert on error
      setIsLiked(!newLiked);
      setLikeCount((prev) => (!newLiked ? prev + 1 : prev - 1));
      toast.error('Failed to like post.');
    }
  };

  const handleSave = async () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    setSaveCount((prev) => (newSaved ? prev + 1 : prev - 1));
    if (onSaveChange) onSaveChange(post.id, newSaved ? saveCount + 1 : saveCount - 1, newSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${author.displayName}`,
        text: post.content.substring(0, 100),
        url: window.location.origin + `/feed/post/${post.id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/feed/post/${post.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link to={`/profile/${post.userId}`} className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            {author.photoURL ? (
              <img src={author.photoURL} alt={author.displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-500">
                {author.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{author.displayName}</span>
              {author.isVerifiedStudent && (
                <FiShield className="text-[#D60000]" size={14} title="Verified Student" />
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {post.category} • {formatDistanceToNow(post.createdAt)}
            </div>
          </div>
        </Link>
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap text-[15px] text-slate-800 dark:text-slate-200">
          {post.content}
        </p>
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <span key={tag} className="text-sm font-medium text-[#D60000] dark:text-red-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="relative mb-3 aspect-[4/5] w-full sm:aspect-video rounded-none bg-slate-100 dark:bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIdx}
              src={post.images[currentImageIdx]}
              alt="Post media"
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
          {post.images.length > 1 && (
            <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
              {currentImageIdx + 1} / {post.images.length}
            </div>
          )}
          {post.images.length > 1 && (
            <div className="absolute inset-y-0 flex w-full items-center justify-between px-2">
              <button
                onClick={() => setCurrentImageIdx((i) => (i === 0 ? post.images.length - 1 : i - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentImageIdx((i) => (i === post.images.length - 1 ? 0 : i + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-700/50">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isLiked ? 'text-[#D60000]' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              <FiHeart size={20} fill={isLiked ? '#D60000' : 'none'} />
            </motion.div>
            <span>{likeCount}</span>
          </button>
          
          <Link
            to={`/feed/post/${post.id}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <FiMessageCircle size={20} />
            <span>{post.commentCount}</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <FiShare2 size={20} />
            <span className="hidden sm:inline">{post.shareCount}</span>
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center text-sm font-medium transition-colors ${
            isSaved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <motion.div whileTap={{ scale: 0.8 }}>
            <FiBookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </motion.div>
        </button>
      </div>
    </div>
  );
}
