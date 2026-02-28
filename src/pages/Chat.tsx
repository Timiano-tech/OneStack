import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiChevronLeft } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

const MOCK_ROOMS = [
  {
    id: 'r1',
    listingTitle: 'MacBook Pro 14" M3',
    listingImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100',
    otherUser: { id: 'u2', name: 'Jordan Lee' },
    lastMessage: 'Is it still available?',
    lastMessageAt: new Date().toISOString(),
    unread: 1,
  },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u2', text: 'Hi, is the MacBook still available?', createdAt: new Date(Date.now() - 3600000).toISOString(), read: true },
  { id: 'm2', senderId: 'u1', text: 'Yes! You can pick it up this week.', createdAt: new Date(Date.now() - 3500000).toISOString(), read: true },
  { id: 'm3', senderId: 'u2', text: 'Great. Can we meet at the library tomorrow at 3pm?', createdAt: new Date().toISOString(), read: false },
];

export function Chat() {
  const [rooms] = useState(MOCK_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<typeof MOCK_ROOMS[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [currentUserId] = useState('u1');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        senderId: currentUserId,
        text: input.trim(),
        createdAt: new Date().toISOString(),
        read: false,
      },
    ]);
    setInput('');
  };

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
            {rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
                <p className="text-center text-slate-500 dark:text-slate-400">
                  No conversations yet. Start by messaging a seller from a listing.
                </p>
                <Link to="/listings">
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
                      <img
                        src={room.listingImage}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {room.otherUser.name}
                        </p>
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {room.listingTitle}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-300">
                          {room.lastMessage}
                        </p>
                      </div>
                      {room.unread > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-medium text-white">
                          {room.unread}
                        </span>
                      )}
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
            <img
              src={selectedRoom.listingImage}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {selectedRoom.otherUser.name}
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {selectedRoom.listingTitle}
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
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
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button
                  size="md"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  leftIcon={FiSend}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatedPage>
  );
}
