"use client";

import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMoreHorizontal, FiCornerDownRight, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
import { addComment, deleteComment } from '../../services/feedService';
import { Button } from '../Button';
import { toast } from '../Toast';
import type { Comment } from '../../types';

interface CommentProps {
  comment: Comment;
  replies: Comment[];
  postId: string;
  onCommentAdded: () => void;
  onCommentDeleted: (commentId: string) => void;
}

export function CommentItem({
  comment,
  replies,
  postId,
  onCommentAdded,
  onCommentDeleted,
}: CommentProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Fallback author
  const author = comment.author || {
    fullName: 'Student',
  };

  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;
    setLoading(true);
    try {
      await addComment(postId, user.id, replyContent.trim(), comment.id);
      setReplyContent('');
      setIsReplying(false);
      onCommentAdded();
      toast.success('Reply added.');
    } catch {
      toast.error('Failed to add reply.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this comment?')) {
      try {
        await deleteComment(comment.id, postId);
        onCommentDeleted(comment.id);
        toast.success('Comment deleted.');
      } catch {
        toast.error('Failed to delete comment.');
      }
    }
  };

  const isOwner = user?.id === comment.userId;

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 mt-1">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-500">
            {author.fullName?.charAt(0).toUpperCase() || 'S'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="rounded-2xl bg-slate-100 p-3 pb-2.5 dark:bg-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {author.fullName}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <FiMoreHorizontal size={16} />
              </button>

              <AnimatePresence>
                {showActions && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowActions(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                    >
                      {isOwner && (
                        <button
                          onClick={() => { handleDelete(); setShowActions(false); }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-600 hover:bg-slate-50 dark:text-red-400 dark:hover:bg-slate-800"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      )}
                      {!isOwner && (
                        <button
                          onClick={() => { setShowActions(false); toast.info('Reported comment.'); }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Report
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 px-2 pt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDistanceToNow(comment.createdAt)}
          </span>
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <form onSubmit={handleReplySubmit} className="flex gap-2 relative">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${author.fullName}...`}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#D60000] focus:outline-none focus:ring-1 focus:ring-[#D60000] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <Button type="submit" size="sm" loading={loading} disabled={!replyContent.trim()} className="bg-[#D60000] hover:bg-[#b00000] px-4">
                  Reply
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-slate-100 pl-4 dark:border-slate-800">
            {replies.map((reply) => (
              <div key={reply.id} className="relative">
                <FiCornerDownRight className="absolute -left-5 top-2 text-slate-300 dark:text-slate-700" size={14} />
                <CommentItem
                  comment={reply}
                  replies={[]} // Only allow 1 level nesting for simplicity
                  postId={postId}
                  onCommentAdded={onCommentAdded}
                  onCommentDeleted={onCommentDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

