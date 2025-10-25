// src/App.jsx

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// --- Layouts & Wrappers ---
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminRequired from './components/AdminRequired';
import Loader from './components/common/Loader';
import RequestStatusPage from './pages/RequestStatusPage';

// --- Core Components ---
import Auth from './components/Auth';
import Modal from './components/common/Modal';
import { NotificationProvider } from './context/NotificationContext';

// --- Page Imports (using React.lazy) ---
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthRedirectPage = lazy(() => import('./pages/AuthRedirectPage'));

// --- MOVED TO PUBLIC ---
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));

// Protected Pages
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const SubscriptionDetailPage = lazy(() => import('./pages/SubscriptionDetailPage'));
// ... (all other lazy-loaded protected pages) ...
const DapBuddySubDetailsPage = lazy(() => import('./pages/DapBuddySubDetailsPage'));
const HostedPlanDetailPage = lazy(() => import('./pages/HostedPlanDetailPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const ConnectedAccountsPage = lazy(() => import('./pages/ConnectedAccountsPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const JoinPlanPage = lazy(() => import('./pages/JoinPlanPage'));
const JoinDapBuddyPlanPage = lazy(() => import('./pages/JoinDapBuddyPlanPage'));
const HostPlanPage = lazy(() => import('./pages/HostPlanPage'));
const ServiceRequestPage = lazy(() => import('./pages/ServiceRequestPage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const MemberDetailPage = lazy(() => import('./pages/MemberDetailPage'));
const DisputePage = lazy(() => import('./pages/DisputePage'));
const DisputeStatusPage = lazy(() => import('./pages/DisputeStatusPage'));
const PaymentVerificationPage = lazy(() => import('./pages/PaymentVerificationPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));


// Admin Pages
const GroupManagementPage = lazy(() => import('./pages/admin/GroupManagementPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const GroupDetailPage = lazy(() => import('./pages/admin/GroupDetailPage'));

/**
 * Renders the AuthRedirectPage if no session is found.
 */
const AuthRequired = ({ session, openAuthModal }) => {
  const location = useLocation();

  if (!session) {
    return <AuthRedirectPage location={location} openAuthModal={openAuthModal} />;
  }
  return <Outlet />;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        closeAuthModal();
      }
    });
    return () => subscription.unsubscribe();
  }, [closeAuthModal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-slate-900">
        <Loader />
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader />}>
      <Router>
        <NotificationProvider>
          <Routes>
            {/* --- Admin Routes --- */}
            <Route element={<AdminRequired session={session} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="group/:id" element={<GroupDetailPage />} />
              </Route>
            </Route>

            {/* --- Direct Auth Route --- */}
            <Route path="/auth" element={<Auth />} />

            {/* --- Main Application Routes --- */}
            <Route element={<MainLayout session={session} openAuthModal={openAuthModal} />}>
              
              {/* === PUBLIC ROUTES === */}
              {/* These routes are accessible to everyone, logged in or not. */}
              
              <Route
                path="/"
                element={<HomePage session={session} openAuthModal={openAuthModal} />}
              />
              
              {/* MOVED: ExplorePage is now public */}
              <Route
                path="/explore"
                element={<ExplorePage session={session} openAuthModal={openAuthModal} />}
              />
              
              {/* MOVED: MarketplacePage is now public */}
              <Route
                path="/marketplace/:serviceName"
                element={<MarketplacePage session={session} openAuthModal={openAuthModal} />}
              />

              {/* === PROTECTED ROUTES === */}
              {/* All routes inside here will trigger the AuthRedirectPage for guests. */}
              
              <Route element={<AuthRequired session={session} openAuthModal={openAuthModal} />}>
                {/* These routes are from your original file */}
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
                {/* ExplorePage & MarketplacePage were removed from this protected list */}
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
                <Route path="/request-status/:bookingId" element={<RequestStatusPage session={session} />} />
              </Route>
            </Route>
          </Routes>
        </NotificationProvider>

        {/* --- Global Auth Modal --- */}
        <Modal isOpen={showAuthModal} onClose={closeAuthModal}>
          <Auth />
        </Modal>
      </Router>
    </Suspense>
  );
}

export default App;