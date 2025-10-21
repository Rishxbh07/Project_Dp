// src/components/layout/navbar/HamburgerMenu.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { ChevronRight, X, Search, Sun, Moon, Wrench, ShieldAlert } from 'lucide-react';
import Modal from '../../common/Modal';
import Auth from '../../Auth';
import { ThemeContext } from '../../../context/ThemeContext';

const HamburgerMenu = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState({
    username: session?.user?.email?.charAt(0).toUpperCase() || '',
    pfp_url: null
  });

  // fetch user info & admin status
  useEffect(() => {
    const fetchProfileAndAdminStatus = async () => {
      if (session?.user) {
        const [profileRes, adminRes] = await Promise.all([
          supabase.from('profiles').select('username, pfp_url').eq('id', session.user.id).single(),
          supabase.from('admins').select('user_id', { count: 'exact', head: true }).eq('user_id', session.user.id)
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        else if (profileRes.error) {
          setProfile({ username: session.user.email.charAt(0).toUpperCase(), pfp_url: null });
        }
        setIsAdmin(adminRes.count > 0);
      } else setIsAdmin(false);
    };
    fetchProfileAndAdminStatus();
  }, [session]);

  // close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/marketplace/${searchValue.trim().toLowerCase()}`);
      setIsOpen(false);
    }
  };

  const menuItems = [
    { title: "Your Subscriptions", hasArrow: true, path: "/subscription" },
    { title: "Payment Methods", hasArrow: true, path: "/wallet" },
    { title: "Dispute Status", hasArrow: true, path: "/dispute-status", icon: ShieldAlert },
    { title: "Invite & Earn", hasArrow: true, path: "/invite" }
  ];

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        className="relative z-[9999] flex h-10 w-10 items-center justify-center"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-slate-200" />
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <defs>
              <linearGradient id="iconGradient" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <path d="M4 6H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M4 12H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M4 18H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-12 w-[320px] max-w-[90vw] p-4
                     bg-white dark:bg-slate-900/90 backdrop-blur-xl
                     border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl
                     z-[9998]"
        >
          {session ? (
            <div>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center justify-between p-3 rounded-lg text-purple-600 dark:text-purple-300
                             bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50
                             transition-colors mb-2 font-bold"
                >
                  <span className="text-sm flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Admin Dashboard
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}

              {menuItems.map((item, index) => (
                <Link
                  to={item.path}
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg text-slate-700 dark:text-slate-200
                             hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    {item.icon && <item.icon className="w-4 h-4 text-slate-500" />}
                    {item.title}
                  </span>
                  {item.hasArrow && <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {theme === 'dark' ? 'Dark' : 'Light'} Mode
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300
                             ${theme === 'dark'
                               ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                               : 'bg-gray-300'}`}
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
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              Please sign in to see your options.
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
