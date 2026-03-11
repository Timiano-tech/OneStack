import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiUser, FiMessageCircle, FiGrid, FiSun, FiMoon, FiZap } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { SITE } from '../config/site';

interface NavbarProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

const navLinks = [
  { to: '/', label: 'Home', icon: FiGrid },
  { to: '/feed', label: 'Feed', icon: FiGrid },
  { to: '/listings', label: 'Listings', icon: FiSearch },
  { to: '/chat', label: 'Chat', icon: FiMessageCircle },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export function Navbar({
  isAuthenticated = false,
  isAdmin = false,
}: NavbarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 safe-bottom">
      <div className="mx-auto flex h-12 max-w-lg items-center justify-between px-3 sm:h-14 sm:max-w-7xl sm:px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-xl object-contain bg-slate-100 dark:bg-slate-800" />
          <span className="min-w-0 truncate text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-lg">
            {SITE.appName}
          </span>
          <span className="hidden truncate text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">
            · {SITE.campus.shortName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link key={to} to={to}>
                <motion.span
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={18} />
                  {label}
                </motion.span>
              </Link>
            );
          })}
          <Link to="/pricing" className="hidden sm:block">
            <motion.span
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiZap size={16} />
              Upgrade
            </motion.span>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <motion.span
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Admin
              </motion.span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          
          <Link to="/pricing" className="sm:hidden">
            <motion.span
              className="flex items-center justify-center rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiZap size={20} />
            </motion.span>
          </Link>
          {isAuthenticated ? (
            <Link to="/listing/create">
              <motion.span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D60000] text-white shadow-sm hover:bg-[#b00000]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus size={20} />
              </motion.span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <motion.span
                  className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Log in
                </motion.span>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <motion.span
                  className="flex items-center rounded-xl bg-[#D60000] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#b00000]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                </motion.span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
