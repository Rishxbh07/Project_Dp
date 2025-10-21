import React from 'react';
import Logo from '../common/Logo';
import HamburgerMenu from './navbar/HamburgerMenu';
import ResponsiveSearchBar from './navbar/ResponsiveSearchBar';
import ProfileAvatar from './navbar/ProfileAvatar';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const TopNavBar = ({ session }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-white/6 dark:bg-slate-900/80 backdrop-blur-xl
        ${theme === 'dark' ? 'dark:border-white/5' : 'border-slate-100/20'}
        transition-shadow duration-300
      `}
      style={{ WebkitBackdropFilter: 'blur(10px)' }}
    >
      {/* Container: use flex-wrap + overflow-hidden so items never fall off-screen on tiny widths */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div
          className={`
            flex flex-wrap items-center justify-between h-16 lg:h-20 w-full overflow-hidden
          `}
        >
          {/* LEFT: Hamburger + Logo (logo ALWAYS visible; smaller on tiny screens) */}
          <div className="flex items-center gap-3 min-w-[140px]">
            <HamburgerMenu session={session} />

            {/* Show compact logo on mobile, full on desktop */}
            <Link to="/" className="flex items-center">
              <div className="block sm:hidden">
                {/* compact logo for mobile */}
                <span className="text-purple-500 font-extrabold text-lg select-none">dap</span>
                <span className="text-indigo-400 font-extrabold text-lg select-none">Buddy</span>
              </div>
              <div className="hidden sm:block">
                <Logo />
              </div>
            </Link>
          </div>

          {/* CENTER: Search */}
          <div className="flex-1 flex items-center justify-center px-4 min-w-0">
            <div className="w-full max-w-2xl">
              <ResponsiveSearchBar />
            </div>
          </div>

          {/* RIGHT: Host/Auth/Profile - ensure shrink-0 to prevent overflow */}
          <div className="flex items-center gap-3 min-w-[140px] justify-end">
            {session ? (
              <>
                <Link to="/host-plan" className="hidden md:inline-block shrink-0">
                  <button
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] shadow-sm"
                    aria-label="Be a Host"
                  >
                    Be a Host
                  </button>
                </Link>

                {/* Profile avatar should not shrink away */}
                <div className="shrink-0">
                  <ProfileAvatar session={session} />
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <Link to="/auth" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                    Log In
                  </Link>
                  <Link to="/auth?signup=true">
                    <button className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold hover:scale-[1.02]">
                      Sign Up
                    </button>
                  </Link>
                </div>

                {/* Mobile compact auth icon — shrink-0 too */}
                <div className="md:hidden shrink-0">
                  <Link to="/auth">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      <span>Δ</span>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
