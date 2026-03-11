import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiGrid, FiPlusCircle, FiMessageCircle, FiUser } from 'react-icons/fi';

const tabs = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/feed', label: 'Feed', icon: FiGrid },
  { to: '/listing/create', label: 'Sell', icon: FiPlusCircle, primary: true },
  { to: '/chat', label: 'Chat', icon: FiMessageCircle },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/95 md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around">
        {tabs.map(({ to, label, icon: Icon, primary }) => {
          const active =
            to === '/'
              ? location.pathname === '/'
              : location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 pt-3 text-center"
            >
              {primary ? (
                <motion.span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D60000] text-white shadow-lg shadow-red-500/30"
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon size={24} />
                </motion.span>
              ) : (
                <span
                  className={`flex items-center justify-center rounded-xl p-2 transition-colors ${
                    active
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon size={24} />
                </span>
              )}
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                } ${primary ? 'mt-0' : ''}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
