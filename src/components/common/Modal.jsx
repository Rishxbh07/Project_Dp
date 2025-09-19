import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Main overlay that covers the screen
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">

      {/* The actual modal pop-up content */}
      <div className="bg-[#1e2947] p-8 rounded-2xl shadow-xl w-full max-w-sm relative border border-slate-700">

        {/* The 'X' button to close the modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white text-2xl"
        >
          &times;
        </button>

        {/* This is where the content (like the Auth form) will be displayed */}
        {children}

      </div>
    </div>
  );
};

export default Modal;