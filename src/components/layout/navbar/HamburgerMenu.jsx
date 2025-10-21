// src/components/layout/navbar/HamburgerMenu.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient'; // Ensure path is correct
import { ChevronRight, X, Sun, Moon, Wrench, ShieldAlert } from 'lucide-react'; // Removed Search
import Modal from '../../common/Modal';
import Auth from '../../Auth';
import { ThemeContext } from '../../../context/ThemeContext';

// Keep the rest of the component largely the same as provided in context
// It correctly handles its own state (isOpen), dropdown content, and logic.

const HamburgerMenu = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Removed searchValue state as it's handled by ResponsiveSearchBar
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  // Profile state is local to this component now if needed for dropdown header
  const [profile, setProfile] = useState({
      username: session?.user?.email?.charAt(0).toUpperCase() || '',
      pfp_url: null
  });

  useEffect(() => {
    const fetchProfileAndAdminStatus = async () => {
      if (session?.user) {
        // Fetch logic remains the same
        const [profileRes, adminRes] = await Promise.all([
          supabase.from('profiles').select('username, pfp_url').eq('id', session.user.id).single(),
          supabase.from('admins').select('user_id', { count: 'exact', head: true }).eq('user_id', session.user.id)
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
        } else if (profileRes.error) {
           console.error('Error fetching profile for dropdown:', profileRes.error);
           setProfile({ username: session.user.email?.charAt(0).toUpperCase() || '?', pfp_url: null }); // Fallback
        }

        setIsAdmin(adminRes.count > 0);
      } else {
        setIsAdmin(false);
        // Reset profile if user logs out
        setProfile({ username: '', pfp_url: null });
      }
    };
    fetchProfileAndAdminStatus();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click target is the hamburger button itself
      const hamburgerButton = event.target.closest('button[aria-label="Toggle menu"]');
      if (hamburgerButton) return; // Don't close if clicking the button

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Removed handleSearchSubmit

  const menuItems = [
    { title: "Your Subscriptions", hasArrow: true, path: "/subscription" },
    { title: "Payment Methods", hasArrow: true, path: "/wallet" },
    { title: "Dispute Status", hasArrow: true, path: "/dispute-status", icon: ShieldAlert },
    { title: "Invite & Earn", hasArrow: true, path: "/invite" }
  ];

  // Helper function to close menu and navigate
  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  }

  return (
    <>
      {/* Hamburger button */}
     <button
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Toggle menu"
      className="relative z-[30] flex h-10 w-10 lg:h-13 lg:w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
        {isOpen ? (
          <X className="h-6 w-6 text-slate-800 dark:text-slate-200" />
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="iconGradientMenu" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <path d="M4 6H20" stroke="url(#iconGradientMenu)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M4 12H20" stroke="url(#iconGradientMenu)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M4 18H20" stroke="url(#iconGradientMenu)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-14 md:top-16 w-[320px] max-w-[90vw] p-4
                     bg-white dark:bg-slate-900/95 backdrop-blur-xl
                     border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl
                     z-50 animate-in fade-in slide-in-from-top-4 duration-200" // Adjusted animation
        >
          {session ? (
            <div>
              {isAdmin && (
                <button // Changed to button for handleNavigate
                  onClick={() => handleNavigate('/admin')}
                  className="w-full flex items-center justify-between p-3 rounded-lg text-purple-600 dark:text-purple-300
                             bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50
                             transition-colors mb-2 font-bold text-left" // Added text-left
                >
                  <span className="text-sm flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Admin Dashboard
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {menuItems.map((item, index) => (
                <button // Changed to button for handleNavigate
                  onClick={() => handleNavigate(item.path)}
                  key={index}
                  className="w-full flex items-center justify-between p-3 rounded-lg text-slate-700 dark:text-slate-200
                             hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left" // Added text-left and dark hover
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    {item.icon && <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />} {/* Darker icon color */}
                    {item.title}
                  </span>
                  {item.hasArrow && <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                </button>
              ))}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {theme === 'dark' ? 'Dark' : 'Light'} Mode
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                             ${theme === 'dark'
                               ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                               : 'bg-gray-300 dark:bg-slate-700'}`} // Added dark bg for light mode switch
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                                transform transition-transform duration-300
                                ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}
                  ></span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Please sign in to continue.</p>
              <button
                  onClick={() => { setShowAuthModal(true); setIsOpen(false); }}
                  className="w-full px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium transition hover:opacity-90"
                >
                  Sign In / Sign Up
                </button>
            </div>
          )}
        </div>
      )}

      {/* Auth modal */}
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <Auth />
      </Modal>
    </>
  );
};

export default HamburgerMenu;