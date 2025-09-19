import React from 'react';

const SearchBar = () => {
  return (
    <div className="relative my-6">
      <input
        type="text"
        placeholder="Search for Spotify, YouTube, etc."
        className="w-full py-4 pl-12 pr-4 bg-[#1e2947] text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {/* A simple SVG for the search icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;