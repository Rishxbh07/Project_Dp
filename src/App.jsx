import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import WalletPage from './pages/WalletPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionDetailPage from './pages/SubscriptionDetailPage'; // Make sure this is imported
import BottomNavBar from "./components/BottomNavBar";
import { supabase } from './lib/supabaseClient';
import HostPlanPage from './pages/HostPlanPage';

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
        <Route path="/" element={<HomePage session={session} />} />
        <Route path="/marketplace/:serviceName" element={<MarketplacePage />} />
        <Route path="/wallet" element={<WalletPage session={session} />} />
        
        {/* --- CORRECTED ROUTE ORDER --- */}
        <Route path="/subscription/:subscriptionId" element={<SubscriptionDetailPage session={session} />} />
        <Route path="/subscription" element={<SubscriptionPage session={session} />} />
        <Route path="/host-plan" element={<HostPlanPage session={session} />} />
        
      </Routes>
      <BottomNavBar />
    </div>
  );
}

export default App;