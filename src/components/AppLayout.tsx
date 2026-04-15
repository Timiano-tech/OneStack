"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

const BOTTOM_NAV_ROUTES = ['/', '/listings', '/listing/create', '/chat', '/profile'];
const HIDE_NAV_ROUTES = ['/auth', '/login', '/register', '/forgot-password', '/pricing'];

export function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/';
  const showBottomNav = BOTTOM_NAV_ROUTES.some(
    (r) => r === pathname || (r !== '/' && pathname.startsWith(r))
  );
  const showNav = !HIDE_NAV_ROUTES.some((r) => pathname === r || pathname.startsWith(r));

  return (
    <>
      {showNav && (
        <Navbar />
      )}
      <main
        className={`min-h-screen ${
          showBottomNav ? 'pb-20 md:pb-0' : ''
        } ${showNav ? 'pt-14 sm:pt-16' : ''}`}
        style={
          showBottomNav
            ? { paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }
            : undefined
        }
      >
        {children}
      </main>
      {showNav && showBottomNav && <BottomNav />}
    </>
  );
}
