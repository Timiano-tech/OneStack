import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiSearch, FiPlus, FiUser, FiMessageCircle, FiGrid } from 'react-icons/fi';

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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 safe-bottom">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiGrid size={20} />
          </motion.span>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            OneStack
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
          {isAuthenticated && (
            <Link to="/listing/create">
              <motion.span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus size={20} />
              </motion.span>
            </Link>
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
            {isAdmin && (
              <Link
                to="/admin"
                onClick={onMenuToggle}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400"
              >
                Admin
              </Link>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
