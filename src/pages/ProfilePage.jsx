// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import ProfileHeader from '../components/common/ProfileHeader';
import StatCard from '../components/common/StatCard';
import ProfileNav from '../components/common/ProfileNav';
import { 
  Users, CheckSquare, Star, Link as LinkIcon, 
  LogOut, HelpCircle, FileText, Lock, ChevronRight, ChevronLeft 
} from 'lucide-react';

const accountItems = [
    { path: '/achievements', label: 'Achievements', icon: Star },
    { path: '/connected-accounts', label: 'Connected Accounts', icon: LinkIcon },
];
const legalItems = [
    { path: '/help', label: 'Help Center', icon: HelpCircle },
    { path: '/privacy', label: 'Privacy Policy', icon: Lock },
    { path: '/terms', label: 'Terms & Conditions', icon: FileText },
];

const ProfilePage = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ joined: 0, buddies: 0, achievements: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); } else { setSession(session); }
    };
    getSession();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      const fetchProfileData = async () => {
        setLoading(true);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(profileData);
        setStats({ joined: 12, buddies: 23, achievements: 5 });
        setLoading(false);
      };
      fetchProfileData();
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const MobileNavItem = ({ path, label, icon: Icon }) => (
    <Link to={path} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
        <div className="flex items-center gap-4">
            <Icon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
    </Link>
  );

  if (loading || !profile) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-12">
      {/* ✅ STICKY MOBILE HEADER BLOCK */}
      <div className="md:hidden sticky top-0 z-30 -mx-4 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10">
        <div className="flex items-center relative h-16">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white absolute left-1/2 -translate-x-1/2">
              My Profile
            </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 md:pt-0">
        
        <aside className="hidden md:block md:col-span-3 lg:col-span-3">
          <div className="sticky top-24"><ProfileNav /></div>
        </aside>

        <main className="md:col-span-9 lg:col-span-9">
          <div className="space-y-8">
            <ProfileHeader profile={profile} session={session} />
            
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">My Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <StatCard icon={CheckSquare} label="Plans Joined" value={stats.joined} />
                <StatCard icon={Users} label="Buddies" value={stats.buddies} />
                <StatCard icon={Star} label="Achievements" value={stats.achievements} />
              </div>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800">
              <h3 className="text-lg font-bold">Activity Feed</h3>
              <p className="text-slate-500 mt-2">Your recent activity will appear here.</p>
            </div>
            
            <div className="space-y-6 md:hidden">
                <div>
                    <h3 className="px-4 pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Account Settings</h3>
                    <div className="space-y-2">
                        {accountItems.map(item => <MobileNavItem key={item.path} {...item} />)}
                    </div>
                </div>
                <div>
                    <h3 className="px-4 pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Support & Legal</h3>
                    <div className="space-y-2">
                        {legalItems.map(item => <MobileNavItem key={item.path} {...item} />)}
                    </div>
                </div>
                <div className="pt-2">
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 rounded-lg font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;