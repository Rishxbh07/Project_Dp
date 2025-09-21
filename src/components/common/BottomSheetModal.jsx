import React from 'react';
import { createPortal } from 'react-dom';

const BottomSheetModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    // Backdrop
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end z-50 animate-in fade-in-25"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-slate-800/95 w-full max-w-md mx-auto rounded-t-3xl p-4 animate-in slide-in-from-bottom-25"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-slate-600 rounded-full mx-auto mb-4"></div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default BottomSheetModal;