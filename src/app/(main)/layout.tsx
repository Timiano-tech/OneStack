"use client";

import { useAuth } from '../../contexts/AuthContext';
import { AppLayout } from '../../components/AppLayout';
import { useEffect, useState } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
