import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white dark:bg-[#0B0F19] md:hidden safe-area-bottom px-2"
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
                <div
                  className="flex h-12 w-12 -mt-6 items-center justify-center rounded-full border-2 border-white dark:border-[#0B0F19] shadow-lg"
                  style={{ 
                    background: '#D60000', 
                    color: 'white',
                  }}
                >
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="relative flex flex-col items-center gap-0.5">
                  <span
                    className="relative z-10 p-1.5 transition-colors"
                    style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  </span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-tight"
                    style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    {label}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
