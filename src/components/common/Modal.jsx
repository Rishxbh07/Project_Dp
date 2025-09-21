import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  // createPortal takes the JSX to render and a DOM element to render it into.
  // We use document.body to ensure it's at the top level.
  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Centered modal content with responsive sizing */}
      <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700/50 p-6 rounded-3xl shadow-2xl w-full max-w-sm mx-auto relative animate-in fade-in duration-300">

        {/* Enhanced close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-all duration-200"
        >
          ×
        </button>

        {/* Modal content */}
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;