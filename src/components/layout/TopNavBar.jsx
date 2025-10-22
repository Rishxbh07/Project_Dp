// src/components/layout/TopNavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './navbar/Logo.new';
import ResponsiveSearchBar from './navbar/ResponsiveSearchBar';
import ProfileAvatar from './navbar/ProfileAvatar';
import AuthButtons from './navbar/AuthButtons';
import NotificationIcon from './navbar/NotificationIcon';
// Plus icon is no longer needed
// import { Plus } from 'lucide-react'; 

const TopNavBar = ({ session }) => {

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-40
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border-b border-slate-200/50 dark:border-white/10
        transition-shadow duration-300
      `}
      style={{ WebkitBackdropFilter: 'blur(10px)' }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20 w-full">

          {/* --- MOBILE LAYOUT --- */}
          <div className="flex items-center justify-between w-full md:hidden">
            {/* Left: Profile Avatar / Auth */}
            <div className="flex-shrink-0">
              {session ? <ProfileAvatar session={session} /> : <AuthButtons />}
            </div>
            
            {/* Center: Logo */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link to="/"><Logo /></Link>
            </div>

            {/* Right: Search, Notifications */}
            {/* ✅ UPDATED: Increased gap from gap-1 to gap-2 for better spacing */}
            <div className="flex items-center gap-2">
              <ResponsiveSearchBar />
              {/* ❌ REMOVED: The "+" (Be a Host) button is gone */}
              <NotificationIcon />
            </div>
          </div>


          {/* --- DESKTOP LAYOUT --- */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link to="/"><Logo /></Link>
            </div>
            
            {/* Center: Search Bar */}
            <div className="flex-1 px-8">
              <div className="w-full max-w-lg mx-auto">
                <ResponsiveSearchBar />
              </div>
            </div>

            {/* Right: Host, Notifications, Profile/Auth */}
            {/* ✅ UPDATED: Increased gap from gap-3 to md:gap-5 for more space */}
            <div className="flex items-center gap-5">
              <Link to="/host-plan">
                <button
                  className="px-4 py-2 rounded-full
                             bg-slate-100 dark:bg-slate-800
                             text-purple-600 dark:text-purple-300
                             text-sm font-semibold
                             transition-all duration-200 hover:scale-[1.02]
                             hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm"
                  aria-label="Be a Host"
                >
                  Be a Host
                </button>
              </Link>
              <NotificationIcon />
              {session ? <ProfileAvatar session={session} /> : <AuthButtons />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;