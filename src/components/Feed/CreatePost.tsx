import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiX } from 'react-icons/fi';
import { Button } from '../Button';
import { toast } from '../Toast';
import type { PostCategory } from '../../types';
import { createPost } from '../../services/feedService';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES: PostCategory[] = ['Marketplace', 'Services', 'Deals', 'Jobs', 'Announcements', 'General'];

interface CreatePostProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function CreatePost({ onSuccess, onClose }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory | 'General'>('General');
  const [hashtagsStr, setHashtagsStr] = useState('');
  const [visibility, setVisibility] = useState<'campus' | 'all_campuses' | 'followers'>('campus');
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed per post');
      return;
    }

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      toast.error('Post cannot be empty.');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to post.');
      return;
    }

    setLoading(true);
    try {
      const hashtags = hashtagsStr
        .split(' ')
        .map(t => t.replace('#', '').trim())
        .filter(t => t.length > 0);

      await createPost({
        userId: user.id,
        campusId: user.campusId || '',
        content,
        category,
        hashtags,
        visibility,
        imageFiles: images.map(i => i.file),
      });

      toast.success('Post created successfully!');
      setContent('');
      setImages([]);
      setHashtagsStr('');
      setCategory('General');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create Post</h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <FiX size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User context top bar */}
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-500">
                {user?.fullName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block text-sm">
              {user?.fullName || 'Loading...'}
            </span>
            <select
              title="Visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="mt-0.5 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full outline-none focus:ring-2 focus:ring-[#D60000] dark:bg-slate-700 dark:text-slate-300"
            >
              <option value="campus">Campus Only</option>
              <option value="all_campuses">University Wide</option>
              <option value="followers">Followers</option>
            </select>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening on campus?"
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-xl border-none bg-transparent p-0 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 sm:text-lg"
        />

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {images.map((img, idx) => (
                <motion.div
                  key={img.url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative h-20 w-20 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900 sm:h-24 sm:w-24 border border-slate-200 dark:border-slate-700"
                >
                  <img src={img.url} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Category & Hashtags */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            title="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PostCategory)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-[#D60000] focus:outline-none focus:ring-1 focus:ring-[#D60000] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <input
            type="text"
            value={hashtagsStr}
            onChange={(e) => setHashtagsStr(e.target.value)}
            placeholder="e.g. #sale #event"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#D60000] focus:outline-none focus:ring-1 focus:ring-[#D60000] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
          />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#D60000] hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/20">
              <FiImage size={20} />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
                disabled={images.length >= 5}
              />
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {images.length}/5 max
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className={`${content.length > 480 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              {content.length}/500
            </span>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || (!content.trim() && images.length === 0)}
              className="bg-[#D60000] text-white hover:bg-[#b00000] px-6"
            >
              Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
