import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './lib/supabaseClient';

import HomePage from './pages/HomePage';
import SubscriptionPage from './pages/SubscriptionPage';
import HostedPlanDetailPage from './pages/HostedPlanDetailPage';
import SubscriptionDetailPage from './pages/SubscriptionDetailPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MarketplacePage from './pages/MarketplacePage';
import JoinPlanPage from './pages/JoinPlanPage';
import ExplorePage from './pages/ExplorePage'; 
import HostPlanPage from './pages/HostPlanPage';
import ServiceRequestPage from './pages/ServiceRequestPage';
import InvitePage from './pages/InvitePage';
import AchievementsPage from './pages/AchievementsPage';
import Auth from './components/Auth';
import MainLayout from './components/layout/MainLayout';
import ConnectAccountPage from './pages/ConnectAccountPage';

const PrivateRoute = ({ session }) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return (
    <MainLayout>
      {/* Pass session to all child routes through the Outlet's context */}
      <Outlet context={{ session }} />
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
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<PrivateRoute session={session} />}>
            {/* --- FIX: Pass the session prop to all child elements --- */}
            <Route path="/" element={<HomePage session={session} />} />
            <Route path="/subscription" element={<SubscriptionPage session={session} />} />
            <Route path="/subscription/:id" element={<SubscriptionDetailPage session={session} />} />
            <Route path="/hosted-plan/:id" element={<HostedPlanDetailPage session={session} />} />
            <Route path="/wallet" element={<WalletPage session={session} />} />
            <Route path="/profile" element={<ProfilePage session={session} />} />
            <Route path="/edit-profile" element={<EditProfilePage session={session} />} />
            <Route path="/notifications" element={<NotificationsPage session={session} />} />
            <Route path="/explore" element={<ExplorePage session={session} />} />
            <Route path="/marketplace/:serviceName" element={<MarketplacePage session={session} />} />
            <Route path="/join-plan/:listingId" element={<JoinPlanPage session={session} />} />
            <Route path="/host-plan" element={<HostPlanPage session={session} />} />
            <Route path="/host-plan" element={<HostPlanPage session={session} />} />
            <Route path="/request-service" element={<ServiceRequestPage session={session} />} />
            <Route path="/invite" element={<InvitePage session={session} />} />
            <Route path="/achievements" element={<AchievementsPage session={session} />} />
            <Route path="/connect-account/:bookingId" element={<ConnectAccountPage session={session} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;