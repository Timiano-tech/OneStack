import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

const BOTTOM_NAV_ROUTES = ['/', '/listings', '/listing/create', '/chat', '/profile'];
const HIDE_NAV_ROUTES = ['/login', '/register', '/forgot-password', '/pricing'];

export function AppLayout({
  isAuthenticated = false,
  isAdmin = false,
  menuOpen,
  onMenuToggle,
}: {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const showBottomNav = BOTTOM_NAV_ROUTES.some(
    (r) => r === pathname || (r !== '/' && pathname.startsWith(r))
  );
  const showNav = !HIDE_NAV_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '?'));

  return (
    <>
      {showNav && (
        <Navbar
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          menuOpen={menuOpen}
          onMenuToggle={onMenuToggle}
        />
      )}
      <main
        className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${
          showBottomNav ? 'pb-20 md:pb-0' : ''
        } ${showNav ? 'pt-14 sm:pt-16' : ''}`}
        style={
          showBottomNav
            ? { paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }
            : undefined
        }
      >
        <Outlet />
      </main>
      {showNav && showBottomNav && <BottomNav />}
    </>
  );
}
