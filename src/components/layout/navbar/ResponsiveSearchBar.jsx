import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Responsive Search Bar
 * - Desktop: shows full rounded search bar (re-uses your styling)
 * - Mobile: shows an icon; when clicked an overlay input appears (absolute, no layout shift)
 * - Overlay uses absolute positioning so it doesn't move other nav items.
 */

const ResponsiveSearchBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mobileOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mobileOpen]);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
      if (e.key === 'Enter' && mobileOpen && query.trim()) {
        navigate(`/marketplace/${encodeURIComponent(query.trim().toLowerCase())}`);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, query, navigate]);

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/marketplace/${encodeURIComponent(query.trim().toLowerCase())}`);
    setMobileOpen(false);
  };

  return (
    <div className="relative">
      {/* Desktop visible full search */}
      <form
        onSubmit={submit}
        className="hidden md:flex items-center w-full"
        role="search"
        aria-label="Search"
      >
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Spotify, YouTube, Netflix..."
            className="w-full pl-12 pr-4 py-3 rounded-full bg-slate-800/60 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>
      </form>

      {/* Mobile icon */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open search"
          className="p-2 rounded-lg text-slate-200 hover:bg-white/5 transition"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay: absolute, centered above content but doesn't change layout */}
      {mobileOpen && (
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div className="mt-14 pointer-events-auto w-[92%] sm:w-[640px]">
            <form onSubmit={submit} className="relative">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for Spotify, YouTube, Netflix..."
                  className="w-full pl-14 pr-12 py-3 rounded-2xl bg-slate-800/70 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label="Close search"
                >
                  ✕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveSearchBar;
