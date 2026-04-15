"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { PostCard } from '../components/Feed/PostCard';
import { CommentItem } from '../components/Feed/CommentItem';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getComments, addComment, getPostById } from '../services/feedService';
import { Button } from '../components/Button';
import { toast } from '../components/Toast';
import type { Post, Comment } from '../types';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const fetchPostAndComments = useCallback(async () => {
    if (!id) return;
    try {
      const postData = await getPostById(id);

      if (postData) {
        setPost(postData);
        const fetchedComments = await getComments(id);
        setComments(fetchedComments);
      } else {
        toast.error('Post not found');
        router.push('/feed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load post details');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !id) return;
    setAddingComment(true);
    try {
      await addComment(id, user.id, newComment.trim());
      setNewComment('');
      fetchPostAndComments(); // Refresh comments
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return (
      <AnimatedPage className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#D60000]" />
      </AnimatedPage>
    );
  }

  if (!post) return null;

  // Group nested comments
  const rootComments = comments.filter(c => !c.parentCommentId);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parentCommentId) {
      if (!acc[c.parentCommentId]) acc[c.parentCommentId] = [];
      acc[c.parentCommentId].push(c);
    }
    return acc;
  }, {} as Record<string, Comment[]>);

  return (
    <AnimatedPage className="min-h-[calc(100vh-3.5rem)] bg-slate-50 pb-20 dark:bg-slate-900 md:pb-6">
      
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 dark:border-slate-800/95">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Post</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4 sm:py-6">
        <PostCard 
          post={post} 
          onLikeChange={(_, count) => setPost(p => p ? { ...p, likeCount: count } : p)}
          onSaveChange={(_, count) => setPost(p => p ? { ...p, saveCount: count } : p)}
        />

        {/* Comment Section */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-100 p-4 dark:border-slate-700/50">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Comments ({post.commentCount})</h2>
          </div>

          <div className="p-4 space-y-6">
            {rootComments.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              rootComments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={repliesByParent[comment.id] || []}
                  postId={post.id}
                  onCommentAdded={fetchPostAndComments}
                  onCommentDeleted={(commentId) => {
                    setComments(prev => prev.filter(c => c.id !== commentId && c.parentCommentId !== commentId));
                    setPost(p => p ? {...p, commentCount: Math.max(0, p.commentCount - 1)} : p);
                  }}
                />
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <div className="border-t border-slate-100 p-4 pb-4 dark:border-slate-700/50">
            <form onSubmit={handleAddComment} className="flex gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="You" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-slate-500">
                    {user?.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-[#D60000] focus:outline-none focus:ring-1 focus:ring-[#D60000] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <Button 
                  type="submit" 
                  loading={addingComment} 
                  disabled={!newComment.trim()}
                  className="bg-[#D60000] text-white hover:bg-[#b00000] px-5"
                >
                  Post
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}

