"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Home } from '../../views/Home';
import { Feed } from '../../views/Feed';
import { useAuth } from '../../contexts/AuthContext';

export default function HomePage() { 
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  return (
    <main className="w-full flex flex-col min-h-screen">
      {user ? <Feed /> : <Home />}
    </main>
  );
}

