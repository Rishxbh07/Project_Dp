// src/components/layout/navbar/AuthButtons.jsx
import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Auth from '../../Auth';

const AuthButtons = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-4 py-2 text-purple-600 dark:text-purple-300 font-semibold text-sm"
        >
          Log In
        </button>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium"
        >
          Sign Up
        </button>
      </div>
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <Auth />
      </Modal>
    </>
  );
};

export default AuthButtons;
