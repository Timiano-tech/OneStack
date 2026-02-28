import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';

// Main pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Listings } from './pages/Listings';
import { CreateListing } from './pages/CreateListing';
import { ListingDetail } from './pages/ListingDetail';
import { Profile } from './pages/Profile';
import { Chat } from './pages/Chat';
import { ForgotPassword } from './pages/ForgotPassword';

// Admin
import { AdminLayout } from './pages/Admin/AdminLayout';
import { Dashboard } from './pages/Admin/Dashboard';
import { Users } from './pages/Admin/Users';
import { Listings as AdminListings } from './pages/Admin/Listings';
import { Reports } from './pages/Admin/Reports';
import { Analytics } from './pages/Admin/Analytics';

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {!isAdmin && (
        <Navbar
          isAuthenticated={false}
          isAdmin={false}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((o) => !o)}
        />
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listing/create" element={<CreateListing />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <AppRoutes />
    </BrowserRouter>
  );
}
