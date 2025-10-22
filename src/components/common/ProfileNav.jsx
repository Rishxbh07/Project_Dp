// src/components/common/ProfileNav.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Shield, Star, Link as LinkIcon, LogOut, HelpCircle, FileText, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const ProfileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const accountItems = [
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/achievements', label: 'Achievements', icon: Star },
    { path: '/connected-accounts', label: 'Connected Accounts', icon: LinkIcon },
  ];

  const legalItems = [
      { path: '/help', label: 'Help Center', icon: HelpCircle },
      { path: '/privacy', label: 'Privacy Policy', icon: Lock },
      { path: '/terms', label: 'Terms & Conditions', icon: FileText },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="flex flex-col gap-1">
        <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</h3>
        {accountItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors duration-200
                ${isActive(item.path)
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? '' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
        ))}

        <div className="pt-4">
            <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Support & Legal</h3>
            {legalItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors duration-200
                    ${isActive(item.path)
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <item.icon className="w-5 h-5 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
            ))}
        </div>

        <div className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
        </div>
    </nav>
  );
};

export default ProfileNav;