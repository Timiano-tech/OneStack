import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiSearch, FiPlus, FiUser, FiMessageCircle, FiGrid, FiSun, FiMoon, FiZap } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { SITE } from '../config/site';

interface NavbarProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

const navLinks = [
  { to: '/', label: 'Home', icon: FiGrid },
  { to: '/listings', label: 'Listings', icon: FiSearch },
  { to: '/chat', label: 'Chat', icon: FiMessageCircle },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export function Navbar({
  isAuthenticated = false,
  isAdmin = false,
  onMenuToggle,
  menuOpen = false,
}: NavbarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 safe-bottom">
      <div className="mx-auto flex h-12 max-w-lg items-center justify-between px-3 sm:h-14 sm:max-w-7xl sm:px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <motion.span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiGrid size={18} />
          </motion.span>
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
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
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
          {isAuthenticated ? (
            <Link to="/listing/create">
              <motion.span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
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
                  className="flex items-center rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign up
                </motion.span>
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 sm:hidden"
        >
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={onMenuToggle}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  location.pathname === to
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}
            <Link
              to="/pricing"
              onClick={onMenuToggle}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400"
            >
              <FiZap size={20} />
              Upgrade to Premium
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={onMenuToggle}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400"
              >
                Admin
              </Link>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  onClick={onMenuToggle}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={onMenuToggle}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
