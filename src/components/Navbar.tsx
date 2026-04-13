'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiUser, FiMessageCircle, FiGrid, FiSun, FiMoon, FiZap, FiLogOut, FiSettings } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SITE } from '../config/site';
import { NotificationBell } from './notifications/NotificationBell';
import { SearchBar } from './ui/SearchBar';

const navLinks = [
  { to: '/', label: 'Home', icon: FiGrid },
  { to: '/feed', label: 'Feed', icon: FiGrid },
  { to: '/listings', label: 'Market', icon: FiMessageCircle },
  { to: '/chat', label: 'Chat', icon: FiMessageCircle },
];

export function Navbar() {
  const pathname = usePathname() || '/';
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    setAvatarMenuOpen(false);
  };

  const avatarUrl = user?.avatarUrl || user?.user_metadata?.avatar_url || null;
  const fullName = user?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="glass-nav sticky top-0 z-40 safe-area-top">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4 sm:max-w-7xl">
        
        {/* Logo */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl"
            style={{ background: 'var(--primary)' }}>
            <img src="/OneStack (1).png" alt="Logo" className="h-full w-full object-contain" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-white font-black text-sm">O</span>
          </div>
          <span className="truncate text-base font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            {SITE.appName}
          </span>
          <span className="hidden text-xs font-medium sm:inline" style={{ color: 'var(--text-muted)' }}>
            · {SITE.campus?.shortName}
          </span>
        </Link>

        {/* Center: Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-xs mx-6">
          <SearchBar />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link key={to} href={to}>
                <motion.span
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: active ? 'var(--primary-muted)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {label}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </motion.button>

          {user ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* Create listing */}
              <Link href="/listing/create" className="hidden sm:flex">
                <motion.span
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-white"
                  style={{ background: 'var(--primary)', boxShadow: 'var(--shadow-blue)' }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FiPlus size={16} />
                  Sell
                </motion.span>
              </Link>

              {/* Avatar dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setAvatarMenuOpen((o) => !o)}
                  className="h-9 w-9 overflow-hidden rounded-full"
                  style={{ border: '2px solid var(--primary)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'var(--primary)' }}>
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {avatarMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setAvatarMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        className="absolute right-0 top-11 z-50 w-48 rounded-2xl py-1 shadow-xl"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
                      >
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{fullName}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        </div>
                        {[
                          { href: '/profile', label: 'Profile', icon: FiUser },
                          { href: '/settings', label: 'Settings', icon: FiSettings },
                          { href: '/pricing', label: 'Upgrade', icon: FiZap },
                        ].map(({ href, label, icon: Icon }) => (
                          <Link key={href} href={href} onClick={() => setAvatarMenuOpen(false)}>
                            <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-elevated)]"
                              style={{ color: href === '/pricing' ? 'var(--secondary)' : 'var(--text-secondary)' }}>
                              <Icon size={15} />
                              {label}
                            </div>
                          </Link>
                        ))}
                        <div className="border-t mt-1" style={{ borderColor: 'var(--border)' }}>
                          <button onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-elevated)]"
                            style={{ color: '#ef4444' }}>
                            <FiLogOut size={15} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:flex">
                <motion.span
                  className="flex items-center rounded-xl px-3 py-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                  whileHover={{ scale: 1.02 }}
                >
                  Log in
                </motion.span>
              </Link>
              <Link href="/register">
                <motion.span
                  className="flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: 'var(--primary)', boxShadow: 'var(--shadow-blue)' }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Join
                </motion.span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
