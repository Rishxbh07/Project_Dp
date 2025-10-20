import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// Layouts and Auth
import MainLayout from './components/layout/MainLayout';
import Auth from './components/Auth';
import Modal from './components/common/Modal';
import OptionalLoginPopup from './components/OptionalLoginPopup';

// Page Components
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MarketplacePage from './pages/MarketplacePage';
import SubscriptionPage from './pages/SubscriptionPage';
import HostedPlanDetailPage from './pages/HostedPlanDetailPage';
import SubscriptionDetailPage from './pages/SubscriptionDetailPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import JoinPlanPage from './pages/JoinPlanPage';
import HostPlanPage from './pages/HostPlanPage';
import ServiceRequestPage from './pages/ServiceRequestPage';
import InvitePage from './pages/InvitePage';
import AchievementsPage from './pages/AchievementsPage';
import ConnectedAccountsPage from './pages/ConnectedAccountsPage';
import MemberDetailPage from './pages/MemberDetailPage';
import DisputePage from './pages/DisputePage';
import DisputeStatusPage from './pages/DisputeStatusPage';
import JoinDapBuddyPlanPage from './pages/JoinDapBuddyPlanPage';
import PaymentPage from './pages/PaymentPage';
import PaymentVerificationPage from './pages/PaymentVerificationPage';
import DapBuddySubDetailsPage from './pages/DapBuddySubDetailsPage';
import FriendsPage from './pages/FriendsPage';

// Admin Components
import AdminRequired from './components/AdminRequired';
import AdminLayout from './pages/admin/AdminLayout';
import UserManagementPage from './pages/admin/UserManagementPage';
import GroupManagementPage from './pages/admin/GroupManagementPage';
import GroupDetailPage from './pages/admin/GroupDetailPage';


// Wrapper to protect routes that require a logged-in user.
const AuthRequired = ({ session, onAuthRequired }) => {
    const location = useLocation();
    useEffect(() => {
        if (!session) {
            onAuthRequired();
        }
    }, [session, onAuthRequired]);

    if (!session) {
        // While waiting for the auth modal to open, you can show a loader or nothing.
        // Or redirect immediately if you prefer that behavior.
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    return <Outlet />;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOptionalLogin, setShowOptionalLogin] = useState(false);


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

  // Effect to show the optional login popup for new, non-logged-in users.
  useEffect(() => {
    if (!loading && !session && !sessionStorage.getItem('hasSeenOptionalLogin')) {
      // Use a small timeout to let the main page render first
      const timer = setTimeout(() => {
        setShowOptionalLogin(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, session]);


  if (loading) {
    return <div></div>; // Keep this minimal to avoid layout shift before the loader page shows
  }
  
  const handleAuthRequired = () => {
      setShowAuthModal(true);
  };

  return (
    <>
      <Router>
        <Routes>
          {/* Admin routes remain protected at the top level */}
          <Route element={<AdminRequired session={session} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="groups" element={<GroupManagementPage />} />
              <Route path="group/:groupId" element={<GroupDetailPage />} />
              <Route path="dashboard" element={<h1>Admin Dashboard</h1>} />
              <Route path="disputes" element={<h1>Dispute Management</h1>} />
              <Route path="analytics" element={<h1>Analytics</h1>} />
            </Route>
          </Route>

          {/* Publicly browsable pages */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage session={session} />} />
            <Route path="/explore" element={<ExplorePage session={session} />} />
            <Route path="/marketplace/:serviceName" element={<MarketplacePage session={session} />} />
            <Route path="/auth" element={<Auth onSuccess={() => setShowAuthModal(false)} />} />
             {/* Add any other pages you want to be public here */}
          </Route>

          {/* Protected pages that require login */}
          <Route element={<AuthRequired session={session} onAuthRequired={handleAuthRequired} />}>
            <Route element={<MainLayout />}>
              <Route path="/subscription" element={<SubscriptionPage session={session} />} />
              <Route path="/subscription/:id" element={<SubscriptionDetailPage session={session} />} />
              <Route path="/dapbuddy-subscription/:id" element={<DapBuddySubDetailsPage session={session} />} />
              <Route path="/hosted-plan/:id" element={<HostedPlanDetailPage session={session} />} />
              <Route path="/wallet" element={<WalletPage session={session} />} />
              <Route path="/profile" element={<ProfilePage session={session} />} />
              <Route path="/edit-profile" element={<EditProfilePage session={session} />} />
              <Route path="/profile/connected-accounts" element={<ConnectedAccountsPage session={session} />} />
              <Route path="/friends" element={<FriendsPage session={session} />} />
              <Route path="/notifications" element={<NotificationsPage session={session} />} />
              <Route path="/join-plan/:listingId" element={<JoinPlanPage session={session} />} />
              <Route path="/join-dapbuddy-plan/:planId" element={<JoinDapBuddyPlanPage session={session} />} />
              <Route path="/host-plan" element={<HostPlanPage session={session} />} />
              <Route path="/request-service" element={<ServiceRequestPage session={session} />} />
              <Route path="/invite" element={<InvitePage session={session} />} />
              <Route path="/achievements" element={<AchievementsPage session={session} />} />
              <Route path="/hosted-plan/member/:bookingId" element={<MemberDetailPage session={session} />} />
              <Route path="/dispute/:bookingId" element={<DisputePage session={session} />} />
              <Route path="/dispute-status" element={<DisputeStatusPage session={session} />} />
              <Route path="/payment-verification" element={<PaymentVerificationPage session={session} />} />
              <Route path="/pay" element={<PaymentPage session={session} />} />
            </Route>
          </Route>
        </Routes>
      </Router>

      {/* Render the new popup conditionally */}
      <OptionalLoginPopup
        isOpen={showOptionalLogin}
        onClose={() => {
          setShowOptionalLogin(false);
          sessionStorage.setItem('hasSeenOptionalLogin', 'true');
        }}
        onAuthClick={() => {
          setShowOptionalLogin(false);
          sessionStorage.setItem('hasSeenOptionalLogin', 'true');
          setShowAuthModal(true);
        }}
      />

      {/* Render the existing Auth component inside a Modal */}
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <Auth onSuccess={() => setShowAuthModal(false)} />
      </Modal>
    </>
  );
}

export default App;