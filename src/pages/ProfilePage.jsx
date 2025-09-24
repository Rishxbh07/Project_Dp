import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronRight, Star, Award, Shield, HelpCircle, LogOut, User, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import Modal from '../components/common/Modal';

// A component for the trend indicator icons
const TrendIndicator = ({ trend }) => {
  if (trend === 'up') {
    return <ArrowUp className="w-4 h-4 text-green-500" />;
  }
  if (trend === 'down') {
    return <ArrowDown className="w-4 h-4 text-red-500" />;
  }
  return <Minus className="w-4 h-4 text-gray-500 dark:text-slate-400" />;
};


const ProfilePage = ({ session }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(null); // 'host' or 'user'
  const [savePassword, setSavePassword] = useState(true);
  const [profile, setProfile] = useState({
    username: 'dapbuddy_user',
    email: 'user@example.com',
    avatarUrl: null,
    hostRating: 0,
    loyaltyScore: 0, // <-- FIX: Changed from userRating
    hostRatingTrend: 'same', // 'up', 'down', or 'same'
    userRatingTrend: 'up',
  });
  const [loading, setLoading] = useState(true);

  const user = session?.user;

  // --- FIX: Correctly fetch and combine user and profile data ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        // Set email from the session immediately
        setProfile(prev => ({ ...prev, email: user.email }));

        // --- FIX: Changed user_rating to loyalty_score in the query ---
        const { data, error } = await supabase
          .from('profiles')
          .select('username, host_rating, loyalty_score')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Fallback to session data if profile doesn't exist yet
          setProfile(prev => ({
              ...prev,
              username: user.user_metadata?.username || prev.username,
          }));
        } else if (data) {
          setProfile(prev => ({
            ...prev,
            username: data.username || user.user_metadata?.username || prev.username,
            hostRating: data.host_rating || 0,
            loyaltyScore: data.loyalty_score || 0, // <-- FIX: Changed from userRating
          }));
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: Award, text: 'Achievements / Badges', path: '/profile/achievements' },
    { icon: Shield, text: 'Privacy', path: '/profile/privacy' },
    { icon: HelpCircle, text: 'Help & Support', path: '/profile/support' },
  ];
  
  // --- ADDED: Dummy data for rating details ---
  const hostRatingDetails = [
      { reason: "Successful plan renewal", score: "+0.1", positive: true },
      { reason: "Positive review from a member", score: "+0.2", positive: true },
      { reason: "Late credential sharing", score: "-0.3", positive: false },
      { reason: "Dispute filed by a user", score: "-0.5", positive: false },
  ];

  const userRatingDetails = [
      { reason: "Joined a new plan", score: "+5", positive: true },
      { reason: "On-time payment", score: "+10", positive: true },
      { reason: "Referred a new user", score: "+20", positive: true },
      { reason: "Left a plan mid-cycle", score: "-15", positive: false },
  ];


  return (
    <>
      <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
          <div className="max-w-md mx-auto px-4 py-4 flex justify-center items-center">
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-6">
          <section className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl mb-6 border border-gray-200 dark:border-transparent">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">{loading ? '...' : profile.username}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">{loading ? '...' : profile.email}</p>
            </div>
            <Link
              to="/edit-profile"
              className="bg-gray-200 dark:bg-slate-700/50 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-300 text-xs font-semibold py-2 px-4 rounded-full transition-colors"
            >
              Edit
            </Link>
          </section>

          <section className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={() => setShowRatingModal('host')} className="text-left bg-white dark:bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <p className="font-semibold text-gray-800 dark:text-slate-300 text-sm">Your Host Rating</p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="currentColor" />
                <p className="font-bold text-2xl text-yellow-600 dark:text-yellow-300">{loading ? '...' : profile.hostRating.toFixed(1)}</p>
                {!loading && <TrendIndicator trend={profile.hostRatingTrend} />}
              </div>
            </button>
            <button onClick={() => setShowRatingModal('user')} className="text-left bg-white dark:bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <p className="font-semibold text-gray-800 dark:text-slate-300 text-sm">Loyalty Score</p>
              <div className="flex items-center gap-2 mt-2">
                <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                {/* --- FIX: Changed profile.userRating to profile.loyaltyScore --- */}
                <p className="font-bold text-2xl text-blue-600 dark:text-blue-300">{loading ? '...' : profile.loyaltyScore}</p>
                 {!loading && <TrendIndicator trend={profile.userRatingTrend} />}
              </div>
            </button>
          </section>

          <section className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-transparent">
            {menuItems.map((item, index) => (
              <Link key={index} to={item.path} className={`flex items-center p-4 ${index < menuItems.length - 1 ? 'border-b border-gray-200 dark:border-white/10' : ''} hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}>
                <item.icon className="w-5 h-5 mr-4 text-gray-500 dark:text-slate-400" />
                <span className="flex-1 font-medium text-gray-800 dark:text-slate-200">{item.text}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              </Link>
            ))}
          </section>

          <section className="mt-4">
             <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center p-4 bg-red-500/10 rounded-2xl hover:bg-red-500/20 transition-colors">
              <LogOut className="w-5 h-5 mr-4 text-red-500 dark:text-red-400" />
              <span className="font-semibold text-red-500 dark:text-red-400">Logout</span>
            </button>
          </section>

          <footer className="text-center mt-12 pb-24">
            <p className="text-xs text-gray-400 dark:text-slate-500">DapBuddy v1.0.0</p>
          </footer>
        </main>
      </div>

      <Modal isOpen={!!showRatingModal} onClose={() => setShowRatingModal(null)}>
        {showRatingModal === 'host' && (
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Host Rating Breakdown</h3>
                <div className="space-y-2">
                    {hostRatingDetails.map((item, index) => (
                        <div key={index} className={`flex justify-between p-2 rounded-lg ${item.positive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            <span className="text-sm text-gray-700 dark:text-slate-300">{item.reason}</span>
                            <span className={`font-semibold ${item.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{item.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {showRatingModal === 'user' && (
             <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Loyalty Score Events</h3>
                <div className="space-y-2">
                    {userRatingDetails.map((item, index) => (
                        <div key={index} className={`flex justify-between p-2 rounded-lg ${item.positive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            <span className="text-sm text-gray-700 dark:text-slate-300">{item.reason}</span>
                            <span className={`font-semibold ${item.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{item.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </Modal>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Are you sure you want to logout?</h3>
          <div className="flex items-center justify-center bg-gray-100 dark:bg-slate-800/50 rounded-lg p-3 my-4">
            <input
              type="checkbox"
              id="save-password"
              checked={savePassword}
              onChange={(e) => setSavePassword(e.target.checked)}
              className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-600"
            />
            <label htmlFor="save-password" className="ml-2 text-sm text-gray-800 dark:text-slate-300">Save password for easy login</label>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleLogout} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfilePage;