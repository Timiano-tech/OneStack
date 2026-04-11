import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSend, FiChevronLeft } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Initialize conversations
  useEffect(() => {
    if (!user) return;

    const initChats = async () => {
      setLoading(true);
      try {
        const conversations = await getConversations(user.id);
        setRooms(conversations);

        // If deep-linked from a listing
        if (listingId && sellerId && sellerId !== user.id) {
          const convoId = await getOrCreateConversation(user.id, sellerId, listingId);
          const activeConvo = conversations.find(c => c.id === convoId);
          
          if (activeConvo) {
            setSelectedRoom(activeConvo);
          } else {
            // If it was just created, re-fetch or fetch single
            const updatedConvos = await getConversations(user.id);
            setRooms(updatedConvos);
            const newConvo = updatedConvos.find(c => c.id === convoId);
            if (newConvo) setSelectedRoom(newConvo);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoading(false);
      }
    };

    initChats();
  }, [user, listingId, sellerId]);

  // Handle room selection and real-time subscription
  useEffect(() => {
    if (!selectedRoom || !user) return;

    const fetchHistory = async () => {
      try {
        const history = await getMessages(selectedRoom.id);
        setMessages(history);
        await markAsRead(selectedRoom.id, user.id);
      } catch (err) {
        console.error('Failed to fetch message history', err);
      }
    };

    fetchHistory();

    // Subscribe to new messages
    const sub = subscribeToMessages(selectedRoom.id, (newMsg) => {
      setMessages(prev => {
        // Prevent duplicate messages if sender also receives their own broadcast
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      
      // Auto-mark as read if active
      if (newMsg.senderId !== user.id) {
        markAsRead(selectedRoom.id, user.id);
      }
    });

    channelRef.current = sub;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [selectedRoom, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedRoom || !user) return;

    const content = input.trim();
    setInput('');

    try {
      const sentMsg = await sendChatMessage(selectedRoom.id, user.id, content);
      // Optimistic update handled by Realtime usually, but good to ensure local state if needed
      setMessages(prev => {
        if (prev.some(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (!user) {
    return (
      <AnimatedPage className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">Sign in to chat</h2>
          <p className="mt-2 text-slate-500">You need to be logged in to access your messages.</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button>Sign In</Button>
          </Link>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex h-[calc(100dvh-3.5rem)] flex-col bg-slate-50 dark:bg-slate-900 sm:h-[calc(100dvh-4rem)]">
      {!selectedRoom ? (
        <>
          <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Messages</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chat with sellers privately. Campus-only.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
                <p className="text-center text-slate-500 dark:text-slate-400">
                  No conversations yet. Start by messaging a seller from a listing.
                </p>
                <Link href="/listings">
                  <Button>Browse listings</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {rooms.map((room) => (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className="flex w-full items-center gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700">
                        {room.listing?.images?.[0] ? (
                          <img
                            src={room.listing.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            Chat
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {room.otherParticipant?.displayName || 'User'}
                        </p>
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {room.listing?.title || 'General Chat'}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-300">
                          {room.lastMessage}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setSelectedRoom(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <FiChevronLeft size={24} />
            </button>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
              {selectedRoom.listing?.images?.[0] && <img
                src={selectedRoom.listing.images[0]}
                alt=""
                className="h-full w-full object-cover"
              />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {selectedRoom.otherParticipant?.displayName || 'User'}
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {selectedRoom.listing?.title}
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex max-w-[85%] flex-col">
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      {isMe && msg.readAt && (
                        <span className="mt-1 self-end text-[10px] text-slate-400">Read</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 safe-bottom">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  size="md"
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  leftIcon={FiSend}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatedPage>
  );
}
