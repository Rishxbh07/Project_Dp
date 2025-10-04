import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import MainLayout from './components/layout/MainLayout';
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
import ConnectedAccountsPage from './pages/ConnectedAccountsPage';
import MemberDetailPage from './pages/MemberDetailPage';
import DisputePage from './pages/DisputePage';
import DisputeStatusPage from './pages/DisputeStatusPage';

// --- NEW IMPORTS ---
import AdminRequired from './components/AdminRequired';
import AdminLayout from './pages/admin/AdminLayout';
import UserManagementPage from './pages/admin/UserManagementPage';


// ✅ NEW: A dedicated component to handle the session check.
// Its only job is to check for a session and redirect if one doesn't exist.
const AuthRequired = ({ session }) => {
    const location = useLocation();
    if (!session) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    // If the user is logged in, it renders the child route (<MainLayout /> in our case).
    return <Outlet />;
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
    // You can replace this with a proper loading spinner component
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public route for authentication */}
        <Route path="/auth" element={<Auth />} />

        {/* --- NEW: ADMIN ROUTES --- */}
        <Route element={<AdminRequired session={session} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="groups" element={<GroupManagementPage />} />
            {/* We can add placeholder routes for other admin pages */}
            <Route path="dashboard" element={<h1>Admin Dashboard</h1>} />
            <Route path="disputes" element={<h1>Dispute Management</h1>} />
            <Route path="analytics" element={<h1>Analytics</h1>} />
          </Route>
        </Route>

        {/* ✅ CORRECTED: Protected Routes Structure */}
        {/* 1. The AuthRequired route checks if the user is logged in. */}
        <Route element={<AuthRequired session={session} />}>
          {/* 2. If logged in, it renders the MainLayout route. */}
          {/* 3. MainLayout renders the bottom nav bar and an <Outlet /> for the page content. */}
          <Route element={<MainLayout />}>
            {/* 4. All your protected pages are now children of MainLayout. */}
            <Route path="/" element={<HomePage session={session} />} />
            <Route path="/subscription" element={<SubscriptionPage session={session} />} />
            <Route path="/subscription/:id" element={<SubscriptionDetailPage session={session} />} />
            <Route path="/hosted-plan/:id" element={<HostedPlanDetailPage session={session} />} />
            <Route path="/wallet" element={<WalletPage session={session} />} />
            <Route path="/profile" element={<ProfilePage session={session} />} />
            <Route path="/edit-profile" element={<EditProfilePage session={session} />} />
            <Route path="/profile/connected-accounts" element={<ConnectedAccountsPage session={session} />} />
            <Route path="/notifications" element={<NotificationsPage session={session} />} />
            <Route path="/explore" element={<ExplorePage session={session} />} />
            <Route path="/marketplace/:serviceName" element={<MarketplacePage session={session} />} />
            <Route path="/join-plan/:listingId" element={<JoinPlanPage session={session} />} />
            <Route path="/host-plan" element={<HostPlanPage session={session} />} />
            <Route path="/request-service" element={<ServiceRequestPage session={session} />} />
            <Route path="/invite" element={<InvitePage session={session} />} />
            <Route path="/achievements" element={<AchievementsPage session={session} />} />
            <Route path="/hosted-plan/member/:bookingId" element={<MemberDetailPage session={session} />} />
            <Route path="/dispute/:bookingId" element={<DisputePage session={session} />} />
            <Route path="/dispute-status" element={<DisputeStatusPage session={session} />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;