// src/components/layout/navbar/AuthButtons.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../common/Modal';
import Auth from '../../Auth';

const AuthButtons = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Function to open the modal and potentially navigate
  const openAuthModal = (isSignup = false) => {
    // If you want the modal to reflect signup state, you could pass props to Auth
    // For now, just opening the modal.
    setShowAuthModal(true);
  };

  return (
    <>
      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => openAuthModal(false)}
          className="px-4 py-2 text-purple-600 dark:text-purple-300 font-semibold text-sm hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          Log In
        </button>
        <button
          onClick={() => openAuthModal(true)}
          className="px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium transition hover:opacity-90 shadow-sm hover:shadow-md"
        >
          Sign Up
        </button>
      </div>

      {/* Mobile Button/Icon */}
       <div className="md:hidden">
         <button
           onClick={() => openAuthModal(false)} // Opens modal, defaults to login view in Auth component perhaps
           className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
           aria-label="Login or Sign up"
         >
           {/* You can use a user icon or similar here if preferred */}
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
           </svg>
         </button>
       </div>

      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        {/* Pass navigate function if Auth needs it */}
        <Auth />
      </Modal>
    </>
  );
};

export default AuthButtons;