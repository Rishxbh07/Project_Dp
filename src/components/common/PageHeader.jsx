// src/components/common/PageHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PageHeader = ({ 
    title, 
    onBack, 
    rightAction = null, 
    className = "" 
}) => {
    const navigate = useNavigate();

    // Default back behavior: Go back in history
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300 ${className}`}>
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between relative">
                {/* Left: Back Button */}
                <button 
                    onClick={handleBack} 
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    aria-label="Go back"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                
                {/* Center: Title */}
                {/* We use absolute positioning to ensure it's always dead-center, regardless of left/right button sizes */}
                <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 dark:text-white truncate max-w-[60%] text-center">
                    {title}
                </h1>

                {/* Right: Optional Action (Icon/Link) */}
                <div className="flex items-center -mr-2">
                    {rightAction || <div className="w-10" />} {/* Spacer to balance layout if empty */}
                </div>
            </div>
        </header>
    );
};

export default PageHeader;