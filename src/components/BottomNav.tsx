import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiGrid, FiPlus, FiMessageCircle, FiUser } from 'react-icons/fi';

const tabs = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/feed', label: 'Feed', icon: FiGrid },
  { to: '/listing/create', label: 'Sell', icon: FiPlus, primary: true },
  { to: '/chat', label: 'Chat', icon: FiMessageCircle },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export function BottomNav() {
  const pathname = usePathname() || '/';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t md:hidden safe-area-bottom"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map(({ to, label, icon: Icon, primary }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
          
          return (
            <Link
              key={to}
              href={to}
              className="relative flex flex-1 flex-col items-center justify-center py-2"
            >
              {primary ? (
                <motion.div
                  className="flex h-12 w-12 -mt-6 items-center justify-center rounded-2xl shadow-lg"
                  style={{ 
                    background: 'var(--primary)', 
                    color: 'white',
                    boxShadow: 'var(--shadow-blue)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={24} strokeWidth={3} />
                </motion.div>
              ) : (
                <div className="relative flex flex-col items-center gap-0.5">
                  <motion.span
                    className="relative z-10 p-1.5 transition-colors"
                    style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
                    animate={{ scale: active ? 1.1 : 1 }}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  </motion.span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-tighter"
                    style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    {label}
                  </span>
                  
                  {active && (
                    <motion.div
                      layoutId="bottomNavDot"
                      className="absolute -top-1 h-1 w-1 rounded-full"
                      style={{ background: 'var(--primary)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
