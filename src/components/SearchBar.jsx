import React, { useState } from 'react';

const SearchBar = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="relative my-6">
      {/* Enhanced search container with glassmorphism */}
      <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
        
        {/* Glowing border effect on focus */}
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-sm transition-all duration-300 ${isFocused ? 'opacity-100 scale-105' : 'opacity-0'}`}></div>
        
        {/* Main input container */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
          
          {/* Search input */}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for Spotify, YouTube, Netflix..."
            className="w-full py-5 pl-14 pr-12 bg-transparent text-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 text-lg font-medium transition-all duration-200"
          />
          
          {/* Enhanced search icon with animation */}
          <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFocused ? 'text-purple-300 scale-110' : 'text-slate-400'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          {/* Clear button (appears when there's text) */}
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Trending suggestions (appears on focus when empty) */}
          {isFocused && !searchValue && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
              <p className="text-slate-300 text-sm font-medium mb-3">Trending searches:</p>
              <div className="flex flex-wrap gap-2">
                {['Spotify', 'Netflix', 'YouTube Premium', 'Disney+', 'Prime Video'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchValue(term)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-slate-300 text-sm font-medium transition-all duration-200 hover:scale-105"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Subtle bottom accent line */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent transition-all duration-300 ${isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></div>
      </div>
    </div>
  );
};

export default SearchBar;