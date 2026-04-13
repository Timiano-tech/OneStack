'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { chatBubbleVariant, chatBubbleMineVariant } from '../../lib/animations';
import { ReactionPicker } from './ReactionPicker';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, isMe, onReact }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Group reactions
  const reactions = message.reactions || {};
  const reactionEntries = Object.entries(reactions).filter(([, users]) => users.length > 0);

  const handleLongPressStart = () => {
    const t = setTimeout(() => setShowReactions(true), 500);
    setLongPressTimer(t);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  const handleReact = (emoji: string) => {
    onReact?.(message.id, emoji);
    setShowReactions(false);
  };

  return (
    <motion.div
      variants={isMe ? chatBubbleMineVariant : chatBubbleVariant}
      initial="hidden"
      animate="show"
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        ref={bubbleRef}
        className={`relative flex max-w-[80%] flex-col ${isMe ? 'items-end' : 'items-start'}`}
      >
        {/* Image attachment */}
        {message.mediaUrls && message.mediaUrls.length > 0 && message.mediaType === 'image' && (
          <div className="mb-1 overflow-hidden rounded-xl">
            <img
              src={message.mediaUrls[0]}
              alt="Attachment"
              className="max-h-60 max-w-full object-cover"
            />
          </div>
        )}

        {/* Text bubble */}
        {message.content && (
          <div
            className={`relative px-4 py-2.5 ${isMe ? 'bubble-mine' : 'bubble-theirs'}`}
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onContextMenu={(e) => { e.preventDefault(); setShowReactions(true); }}
            style={{ position: 'relative', cursor: 'default' }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Reaction picker */}
            <ReactionPicker
              visible={showReactions}
              onSelect={handleReact}
              onClose={() => setShowReactions(false)}
              position={isMe ? 'top' : 'top'}
            />
          </div>
        )}

        {/* Reaction pills */}
        {reactionEntries.length > 0 && (
          <div className={`mt-0.5 flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {reactionEntries.map(([emoji, users]) => (
              <motion.button
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onClick={() => handleReact(emoji)}
                whileHover={{ scale: 1.1 }}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Timestamp + read receipts */}
        <div className={`mt-0.5 flex items-center gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {formatDistanceToNow(message.createdAt)}
          </span>
          {isMe && (
            <span>
              {message.readBy && message.readBy.length > 0 ? (
                <FiCheckCircle size={11} style={{ color: 'var(--primary)' }} />
              ) : (
                <FiCheck size={11} style={{ color: 'var(--text-muted)' }} />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
