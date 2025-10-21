// src/components/layout/TopNavBar.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Logo from './navbar/Logo.new'; // ✅ Fixed: Uppercase Logo, removed .jsx extension
import HamburgerMenu from './navbar/HamburgerMenu';
import ResponsiveSearchBar from './navbar/ResponsiveSearchBar';
import ProfileAvatar from './navbar/ProfileAvatar';
import AuthButtons from './navbar/AuthButtons';
import { ThemeContext } from '../../context/ThemeContext';

const TopNavBar = ({ session }) => {
  const { theme } = useContext(ThemeContext);

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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16 lg:h-20 w-full">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-shrink-0 min-w-[120px] md:min-w-[200px]">
            {/* ✅ UPDATED: Hamburger has negative margin to shift left */}
            <div className="-ml-1 md:-ml-2">
              <HamburgerMenu session={session} />
            </div>
            
            <Link to="/" className="hidden md:block">
              <Logo />
            </Link>
          </div>

          {/* CENTER SECTION */}
          <div className="flex-1 flex items-center justify-center px-3 md:px-6 lg:px-8 min-w-0">
             {/* Mobile Logo */}
             <div className="md:hidden">
               <Link to="/">
                  <Logo /> {/* ✅ Fixed: Uppercase Logo */}
               </Link>
             </div>
            {/* Desktop Search Bar */}
            <div className="w-full max-w-2xl hidden md:block">
              <ResponsiveSearchBar />
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-5 flex-shrink-0 min-w-[120px] justify-end">
            {/* Mobile Search Trigger */}
             <div className="md:hidden">
                 <ResponsiveSearchBar />
             </div>

            {/* "Be a Host" Button (Desktop Only) */}
            <Link to="/host-plan" className="hidden md:block">
              <button
                className="px-4 lg:px-5 py-2 lg:py-2.5 rounded-full
                           bg-slate-100 dark:bg-slate-800
                           text-purple-600 dark:text-purple-300
                           text-sm lg:text-base font-semibold
                           transition-all duration-200 hover:scale-[1.02]
                           hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm"
                aria-label="Be a Host"
              >
                Be a Host
              </button>
            </Link>

            {/* Auth Buttons / Profile Avatar */}
            {session ? (
              <ProfileAvatar session={session} />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;