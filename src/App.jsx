import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import WalletPage from './pages/WalletPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionDetailPage from './pages/SubscriptionDetailPage';
import HostPlanPage from './pages/HostPlanPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage'; // <-- IMPORT
import { supabase } from './lib/supabaseClient';
import MainLayout from './components/layout/MainLayout';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <Routes>
        {/* --- Routes WITH BottomNavBar --- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage session={session} />} />
          <Route path="/wallet" element={<WalletPage session={session} />} />
          <Route path="/subscription" element={<SubscriptionPage session={session} />} />
          <Route path="/profile" element={<ProfilePage session={session} />} />
          <Route path="/notifications" element={<NotificationsPage session={session} />} /> {/* <-- ADDED ROUTE */}
        </Route>
        
        {/* --- Routes WITHOUT BottomNavBar --- */}
        <Route path="/marketplace/:serviceName" element={<MarketplacePage />} />
        <Route path="/subscription/:subscriptionId" element={<SubscriptionDetailPage session={session} />} />
        <Route path="/host-plan" element={<HostPlanPage session={session} />} />
        <Route path="/profile/edit" element={<EditProfilePage session={session} />} />
      </Routes>
    </div>
  );
}

export default App;