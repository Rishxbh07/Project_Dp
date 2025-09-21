import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronRight, Star, Award, Shield, HelpCircle, LogOut } from 'lucide-react';
import Modal from '../components/common/Modal';

const ProfilePage = ({ session }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [savePassword, setSavePassword] = useState(true);

  const user = session?.user;

  // Dummy data for display
  const profile = {
    username: user?.user_metadata?.username || 'dapbuddy_user',
    email: user?.email || 'user@example.com',
    avatarUrl: user?.user_metadata?.avatar_url,
    hostRating: 4.9,
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await supabase.auth.signOut();
    // In a real app, you might handle the "savePassword" preference here.
    navigate('/');
  };

  const menuItems = [
    { icon: Award, text: 'Achievements / Badges', path: '/profile/achievements' },
    { icon: Shield, text: 'Privacy', path: '/profile/privacy' },
    { icon: HelpCircle, text: 'Help & Support', path: '/profile/support' },
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
          {/* Account Info Card */}
          <section className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl mb-6 border border-gray-200 dark:border-transparent">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">{profile.username}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">{profile.email}</p>
            </div>
            <Link
              to="/profile/edit"
              className="bg-gray-200 dark:bg-slate-700/50 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-300 text-xs font-semibold py-2 px-4 rounded-full transition-colors"
            >
              Edit
            </Link>
          </section>

          {/* Host Rating Card */}
          <section className="bg-white dark:bg-white/5 p-4 rounded-2xl mb-8 flex justify-between items-center border border-gray-200 dark:border-transparent">
            <p className="font-semibold text-gray-800 dark:text-slate-300">Your Host Rating</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" fill="currentColor" />
              <p className="font-bold text-yellow-600 dark:text-yellow-300">{profile.hostRating}</p>
            </div>
          </section>

          {/* Menu Options */}
          <section className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-transparent">
            {menuItems.map((item, index) => (
              <Link key={index} to={item.path} className={`flex items-center p-4 ${index < menuItems.length - 1 ? 'border-b border-gray-200 dark:border-white/10' : ''} hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}>
                <item.icon className="w-5 h-5 mr-4 text-gray-500 dark:text-slate-400" />
                <span className="flex-1 font-medium text-gray-800 dark:text-slate-200">{item.text}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              </Link>
            ))}
          </section>

          {/* Logout Button */}
          <section className="mt-4">
             <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center p-4 bg-red-500/10 rounded-2xl hover:bg-red-500/20 transition-colors">
              <LogOut className="w-5 h-5 mr-4 text-red-500 dark:text-red-400" />
              <span className="font-semibold text-red-500 dark:text-red-400">Logout</span>
            </button>
          </section>

          {/* Footer Info */}
          <footer className="text-center mt-12 pb-24">
            <p className="text-xs text-gray-400 dark:text-slate-500">DapBuddy v1.0.0</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">For inquiries, contact: support@dapbuddy.com</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">&copy; 2025 DapBuddy Inc. All rights reserved.</p>
          </footer>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
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