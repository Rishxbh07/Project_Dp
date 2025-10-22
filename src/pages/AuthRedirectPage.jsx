// src/pages/AuthRedirectPage.jsx

import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext'; // Make sure this path is correct
import { Lock } from 'lucide-react';
import logo from '/assets/icons/Logo.png'; // Using the main logo

/**
 * Generates a context-specific message based on the path
 * the user was trying to access.
 */
const getAuthMessage = (pathname) => {
  if (pathname.startsWith('/join-plan')) {
    return "To join this group, you need to log in or sign up.";
  }
  if (pathname.startsWith('/profile')) {
    return "To view your profile, please log in or sign up.";
  }
  if (pathname.startsWith('/wallet')) {
    return "To access your wallet, please log in or sign up.";
  }
  if (pathname.startsWith('/host-plan')) {
    return "To host a new plan, please log in or sign up.";
  }
  // Default fallback
  return "To access this page, you need to create a free account or sign in.";
};

/**
 * A theme-aware, dynamic page shown to unauthenticated users
 * when they try to access a protected route.
 */
const AuthRedirectPage = ({ location, openAuthModal }) => {
  const { theme } = useContext(ThemeContext);
  const message = getAuthMessage(location.pathname);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] pt-16 sm:pt-20 px-4 text-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 sm:p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
        
        {/* Header with Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-full">
            <Lock className="w-8 h-8 text-purple-600 dark:text-purple-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Access Restricted
          </h1>
        </div>

        {/* Dynamic Message */}
        <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 mb-8">
          {message}
        </p>

        {/* Call to Action Button */}
        <button
          onClick={openAuthModal}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 sm:py-4 px-10 rounded-xl sm:rounded-2xl transition-transform transform hover:scale-[1.03] shadow-lg shadow-purple-500/30"
        >
          Sign In / Sign Up
        </button>

        {/* Logo at the bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
          <img 
            src={logo} 
            alt="DapBuddy Logo" 
            className={`w-24 mx-auto ${theme === 'light' ? 'opacity-70' : 'opacity-40'}`} 
          />
        </div>
      </div>
    </div>
  );
};

export default AuthRedirectPage;