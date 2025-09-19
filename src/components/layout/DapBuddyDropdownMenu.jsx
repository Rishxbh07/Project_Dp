import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, X, Search } from 'lucide-react';
import Modal from '../common/Modal';
import Auth from '../Auth';
import '../../styles/DropdownMenu.css';

const DapBuddyDropdownMenu = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Focus search input when search opens
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
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center justify-between">
          {/* Hamburger Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="hamburger-btn relative z-50">
            {!isOpen ? (
              <>
                <span className="hamburger-bar"></span>
                <span className="hamburger-bar"></span>
                <span className="hamburger-bar"></span>
              </>
            ) : (
              <X className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Logo and Search Section */}
          <div className="flex items-center space-x-3 flex-1 justify-center">
            {!showSearch ? (
              <>
                {/* Logo */}
                <div className="logo-wrapper">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    DapBuddy
                  </h1>
                </div>
                
                {/* Search Icon */}
                <button
                  onClick={handleSearchToggle}
                  className="p-2 text-slate-400 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg"
                >
                  <Search className="w-5 h-5" />
                </button>
              </>
            ) : (
              /* Search Bar */
              <div className="flex-1 max-w-sm relative">
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search Spotify, Netflix..."
                    className="w-full py-3 pl-4 pr-10 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
                  />
                  <button
                    onClick={handleSearchToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Search Suggestions */}
                {searchValue === '' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-slate-300 text-xs font-medium mb-2">Trending:</p>
                    <div className="flex flex-wrap gap-1">
                      {['Spotify', 'Netflix', 'YouTube', 'Disney+'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchValue(term)}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-slate-300 text-xs font-medium transition-all duration-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center">
            {session ? (
              <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center hover:scale-105 transition-transform"
              >
                {session.user.email.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && session && (
          <div className="dropdown-menu animate-in">
            <div className="dropdown-section">
              {menuItems.map((item, index) => (
                <div key={index} className="menu-item">
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.hasArrow && <ChevronRight className="w-4 h-4 menu-arrow" />}
                </div>
              ))}
              <div className="setting-item mt-4 pt-4 border-t border-white/5">
                <span className="text-sm font-medium">Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`toggle-switch ${darkMode ? 'active' : ''}`}
                >
                  <div className="toggle-thumb"></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <Auth onSuccess={() => setShowAuthModal(false)} />
      </Modal>
    </>
  );
};

export default DapBuddyDropdownMenu;