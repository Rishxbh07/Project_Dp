// src/components/layout/navbar/ResponsiveSearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResponsiveSearchBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when mobile overlay opens
  useEffect(() => {
    if (mobileOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mobileOpen]);

  // Handle Escape key to close mobile search, Enter to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
      if (e.key === 'Enter' && mobileOpen && query.trim() && document.activeElement === inputRef.current) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, query, navigate]);

  const handleSubmit = (e) => {
     if (e) e.preventDefault();
    if (!query.trim()) return;
    navigate(`/marketplace/${encodeURIComponent(query.trim().toLowerCase())}`);
    setMobileOpen(false);
    setQuery('');
  };

  return (
    <div className="relative h-full flex items-center md:w-full">

      {/* --- Desktop visible full search --- */}
      <form
        onSubmit={handleSubmit}
        className="hidden md:flex items-center w-full"
        role="search"
        aria-label="Search Services"
      >
        <div className="relative w-full">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for any service..."
            className="w-full pl-11 pr-4 py-2.5 lg:py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition border border-transparent dark:border-slate-700 focus:border-purple-300 dark:focus:border-purple-600"
          />
        </div>
      </form>

      {/* --- Mobile search icon button --- */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open search"
          className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* --- Mobile search overlay --- */}
      {/* Increased z-index (z-50) */}
      {mobileOpen && (
        <div
          className="fixed top-0 left-0 right-0 h-16 /* Match header height */
                     bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
                     border-b border-slate-200/50 dark:border-white/10
                     px-4 z-50 flex items-center /* Ensure z-50 */
                     md:hidden animate-in fade-in duration-200"
        >
          <form onSubmit={handleSubmit} className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for any service..."
              // Changed rounded-xl to rounded-full
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm"
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResponsiveSearchBar;