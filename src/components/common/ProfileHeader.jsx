// src/components/common/ProfileHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2 } from 'lucide-react';

const ProfileHeader = ({ profile, session }) => {
  const initial = profile.username ? profile.username.charAt(0).toUpperCase() : (session?.user?.email?.charAt(0).toUpperCase() || '?');

  return (
    <div className="relative text-center md:text-left p-4 md:p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="p-1 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
            {profile.pfp_url ? (
              <img
                src={profile.pfp_url}
                alt={profile.username}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover bg-white dark:bg-slate-900 p-1"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white dark:bg-slate-900 p-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-4xl">
                  {initial}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-grow">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{profile.full_name || 'New User'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">@{profile.username || 'username'}</p>
          <p className="text-base text-slate-600 dark:text-slate-300 mt-3 max-w-lg mx-auto md:mx-0">{profile.bio || 'This user has not set a bio yet.'}</p>
        </div>
      </div>
      
      {/* Edit Profile Button */}
      <Link 
        to="/edit-profile" 
        className="absolute top-4 right-4 md:top-6 md:right-6"
        aria-label="Edit Profile"
      >
        <button className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-200">
          <Edit2 className="w-5 h-5" />
        </button>
      </Link>
    </div>
  );
};

export default ProfileHeader;