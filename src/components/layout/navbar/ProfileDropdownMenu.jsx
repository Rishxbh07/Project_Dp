// src/components/layout/navbar/ProfileDropdownMenu.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { ChevronRight, Sun, Moon, ShieldAlert, CreditCard, Gift, LogOut } from 'lucide-react';
import { ThemeContext } from '../../../context/ThemeContext';

const ProfileDropdownMenu = ({ session, profile, onClose }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: CreditCard, title: "Payment Methods", path: "/wallet" },
    { icon: ShieldAlert, title: "Dispute Status", path: "/dispute-status" },
    { icon: Gift, title: "Invite & Earn", path: "/invite" },
  ];

  const initial = profile.username ? profile.username.charAt(0).toUpperCase() : (session?.user?.email?.charAt(0).toUpperCase() || '?');

  return (
    <div
      className="absolute top-full mt-3 w-72 max-w-[80vw]
                 left-0 md:right-0 md:left-auto  /* ✅ THIS IS THE FIX */
                 bg-white dark:bg-slate-900
                 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl
                 z-50 animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <Link to="/profile" onClick={onClose} className="flex items-center gap-3 group">
          {profile.pfp_url ? (
            <img src={profile.pfp_url} alt={profile.username} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xl">
              {initial}
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">{profile.username}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">View your profile</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      <div className="p-2">
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.title}
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="text-sm font-medium flex items-center gap-3">
              <item.icon className="w-5 h-5 text-slate-500" />
              {item.title}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </span>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></span>
          </button>
        </div>
      </div>
      
      <div className="p-2 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdownMenu;