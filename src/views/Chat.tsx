'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiChevronLeft, FiSmile, FiPaperclip } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { ChatRoomSkeleton } from '../components/ui/SkeletonLoader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getConversations,
  getMessages,
  sendMessage as sendChatMessage,
  getOrCreateConversation,
  subscribeToMessages,
  markAsRead
} from '../services/chatService';
import type { Conversation, Message } from '../types';
import { paperPlaneVariants } from '../lib/animations';

export function Chat() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing');
  const sellerId = searchParams.get('seller');

  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendAnim, setSendAnim] = useState(false);
  const [typingVisible, setTypingVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingBroadcastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize conversations
  useEffect(() => {
    if (!user) return;
    const initChats = async () => {
      setLoading(true);
      try {
        const conversations = await getConversations(user.id);
        setRooms(conversations);

        if (listingId && sellerId && sellerId !== user.id) {
          const convoId = await getOrCreateConversation(user.id, sellerId);
          const activeConvo = conversations.find(c => c.id === convoId);
          if (activeConvo) {
            setSelectedRoom(activeConvo);
          } else {
            const updated = await getConversations(user.id);
            setRooms(updated);
            const newConvo = updated.find(c => c.id === convoId);
            if (newConvo) setSelectedRoom(newConvo);
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    initChats();
  }, [user, listingId, sellerId]);

  // Messages + realtime
  useEffect(() => {
    if (!selectedRoom || !user) return;

    const fetchHistory = async () => {
      try {
        const history = await getMessages(selectedRoom.id);
        setMessages(history);
        await markAsRead(selectedRoom.id, user.id);
      } catch (err) { console.error(err); }
    };
    fetchHistory();

    // Subscribe to messages
    const sub = subscribeToMessages(selectedRoom.id, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      if (newMsg.senderId !== user.id) {
        markAsRead(selectedRoom.id, user.id);
      }
    });
    channelRef.current = sub;

    // Subscribe to typing indicators
    const typingSub = supabase
      .channel(`typing:${selectedRoom.id}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setTypingVisible(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setTypingVisible(false), 3000);
        }
      })
      .subscribe();
    typingChannelRef.current = typingSub;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
    };
  }, [selectedRoom, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingVisible]);

  const broadcastTyping = () => {
    if (!selectedRoom || !user) return;
    
    if (typingBroadcastTimeout.current) clearTimeout(typingBroadcastTimeout.current);
    typingBroadcastTimeout.current = setTimeout(() => {
      supabase.channel(`typing:${selectedRoom.id}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id },
      });
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    broadcastTyping();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedRoom || !user || sending) return;
    const content = input.trim();
    setInput('');

    // Paper plane animation
    setSendAnim(true);
    setTimeout(() => setSendAnim(false), 600);

    setSending(true);
    try {
      const sentMsg = await sendChatMessage(selectedRoom.id, user.id, content);
      setMessages(prev => {
        if (prev.some(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  if (!user) {
    return (
      <AnimatedPage className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Sign in to chat</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            You need to be logged in to access your messages.
          </p>
          <Link href="/login" className="mt-4 inline-block">
            <Button>Sign In</Button>
          </Link>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex h-[calc(100dvh-3.5rem)] flex-col" style={{ background: 'var(--bg)' }}>
      {!selectedRoom ? (
        <>
          {/* Conversations list */}
          <div className="border-b px-4 py-4"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Messages</h1>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Chat with sellers privately. Campus-only.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {[...Array(5)].map((_, i) => <ChatRoomSkeleton key={i} />)}
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
                <div className="text-5xl">💬</div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>No conversations yet</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Start by messaging a seller from a listing.
                </p>
                <Link href="/listings">
                  <Button>Browse listings</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {rooms.map((room) => (
                  <motion.li key={room.id} whileHover={{ backgroundColor: 'var(--surface-elevated)' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className="flex w-full items-center gap-4 p-4 text-left"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl"
                        style={{ background: 'var(--surface-elevated)' }}>
                        {room.listing?.images?.[0] ? (
                          <img src={room.listing.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">💬</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                          {room.otherParticipant?.fullName || 'User'}
                        </p>
                        <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {room.listing?.title || 'General Chat'}
                        </p>
                        <p className="mt-0.5 truncate text-sm" style={{ color: 'var(--text-muted)' }}>
                          {room.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {/* Unread count badge */}
                      {room.unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                          style={{ background: 'var(--primary)' }}>
                          {room.unreadCount}
                        </span>
                      )}
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Chat header */}
          <div className="glass-nav flex items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setSelectedRoom(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
              style={{ color: 'var(--text-secondary)' }}>
              <FiChevronLeft size={24} />
            </button>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl"
              style={{ background: 'var(--surface-elevated)' }}>
              {selectedRoom.listing?.images?.[0] && (
                <img src={selectedRoom.listing.images[0]} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {selectedRoom.otherParticipant?.fullName || 'User'}
              </p>
              <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                {selectedRoom.listing?.title || 'Chat'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={msg.senderId === user.id}
                />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typingVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex justify-start"
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="border-t p-3 safe-bottom"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  <FiPaperclip size={18} />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="w-full rounded-full px-4 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  <FiSmile size={18} />
                </button>
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || sending}
                  animate={sendAnim ? 'fly' : 'idle'}
                  variants={paperPlaneVariants}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
                  style={{ background: 'var(--primary)', boxShadow: 'var(--shadow-blue)' }}
                  whileTap={{ scale: 0.93 }}
                >
                  <FiSend size={16} />
                </motion.button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatedPage>
  );
}
