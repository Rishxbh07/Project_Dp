import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, Search, Sun, Moon } from 'lucide-react';
import Modal from '../common/Modal';
import Auth from '../Auth';
import { ThemeContext } from '../../context/ThemeContext';
import '../../styles/DropdownMenu.css';

const DapBuddyDropdownMenu = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    setIsOpen(false);
    if (!showSearch) {
      setSearchValue('');
    }
  };

  const menuItems = [
    { title: "Your Subscriptions", hasArrow: true },
    { title: "Payment Methods", hasArrow: true },
    { title: "Invite & Earn", hasArrow: true }
  ];

  return (
    <>
      <div className={`relative ${isOpen ? 'z-50' : ''}`} ref={dropdownRef}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 flex h-10 w-10 items-center justify-center"
          >
            {isOpen ? <X className="h-6 w-6 text-slate-800 dark:text-white" /> : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="iconGradient" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A855F7"/>
                    <stop offset="1" stopColor="#3B82F6"/>
                  </linearGradient>
                </defs>
                <path d="M4 6H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M4 12H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M4 18H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          <div className="flex items-center space-x-3 flex-1 justify-center">
            {!showSearch ? (
              <>
                <div className="logo-wrapper">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    DapBuddy
                  </h1>
                </div>
                <button
                  onClick={handleSearchToggle}
                  className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                >
                  <Search className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex-1 max-w-sm relative">
                <div className="relative bg-black/5 dark:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/20 rounded-2xl overflow-hidden">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search Spotify, Netflix..."
                    className="w-full py-3 pl-4 pr-10 bg-transparent text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none text-sm font-medium"
                  />
                  <button
                    onClick={handleSearchToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {session ? (
              <Link to="/profile">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center hover:scale-105 transition-transform">
                  {session.user.email.charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="dropdown-menu animate-in bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl">
            {session ? (
              <div className="dropdown-section">
                {menuItems.map((item, index) => (
                  <div key={index} className="menu-item text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.hasArrow && <ChevronRight className="w-4 h-4 menu-arrow text-slate-400 dark:text-slate-500" />}
                  </div>
                ))}
                
                <div className="setting-item mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {theme === 'dark' ? 'Dark' : 'Light'} Mode
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`toggle-switch ${theme === 'dark' ? 'active bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-slate-300'}`}
                  >
                    <div className="toggle-thumb"></div>
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
      </div>
      
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <Auth onSuccess={() => setShowAuthModal(false)} />
      </Modal>
    </>
  );
};

export default DapBuddyDropdownMenu;