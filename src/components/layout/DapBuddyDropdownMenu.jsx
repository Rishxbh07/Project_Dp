import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import Modal from '../common/Modal'; // We need the Modal
import Auth from '../Auth';         // and the Auth form
import '../../styles/DropdownMenu.css';

// The component now accepts the 'session' prop
const DapBuddyDropdownMenu = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false); // State for the modal
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Logo */}
          <div className="logo-wrapper">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              DapBuddy
            </h1>
          </div>

          {/* AUTH LOGIC IS HERE */}
          <div className="flex gap-3">
            {session ? (
              // If logged in, show profile avatar
              <button
                onClick={() => setIsOpen(true)} // Open menu on click
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center"
              >
                {session.user.email.charAt(0).toUpperCase()}
              </button>
            ) : (
              // If logged out, show buttons
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition-colors text-sm"
                >
                  Log in
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all text-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
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

      {/* The authentication modal */}
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <Auth onSuccess={() => setShowAuthModal(false)} />
      </Modal>
    </>
  );
};

export default DapBuddyDropdownMenu;