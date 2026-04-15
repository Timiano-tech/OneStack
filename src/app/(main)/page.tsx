"use client";

import { Home } from '../../views/Home';
import { Feed } from '../../views/Feed';
import { useAuth } from '../../contexts/AuthContext';

export default function HomePage() { 
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  return user ? <Feed /> : <Home />; 
}
