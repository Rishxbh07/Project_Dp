import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './lib/supabaseClient';

import HomePage from './pages/HomePage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionDetailPage from './pages/SubscriptionDetailPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MarketplacePage from './pages/MarketplacePage';
import ExplorePage from './pages/ExplorePage'; // 1. IMPORT
import HostPlanPage from './pages/HostPlanPage';
import Auth from './components/Auth';
import MainLayout from './components/layout/MainLayout';

// A component to protect routes that require authentication
const PrivateRoute = ({ session }) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with your loader component
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<PrivateRoute session={session} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/subscription/:id" element={<SubscriptionDetailPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/explore" element={<ExplorePage />} /> {/* 2. ADDED EXPLORE ROUTE */}
          <Route path="/marketplace/:serviceName" element={<MarketplacePage />} /> {/* 3. UPDATED MARKETPLACE ROUTE */}
          <Route path="/host-plan" element={<HostPlanPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;