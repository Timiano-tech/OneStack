import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.05)] dark:bg-[#09090b] dark:border-slate-800/80 md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around">
        {tabs.map(({ to, label, icon: Icon, primary }) => {
          const active =
            to === '/'
              ? pathname === '/'
              : pathname === to || pathname?.startsWith(to + '/');
          return (
            <Link
              key={to}
              href={to}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 pt-3 text-center"
            >
              {primary ? (
                <motion.span
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-soft"
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon size={24} />
                </motion.span>
              ) : (
                <span
                  className={`flex items-center justify-center rounded-xl p-2 transition-colors ${
                    active
                      ? 'text-accent dark:text-red-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon size={24} />
                </span>
              )}
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-accent dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
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
