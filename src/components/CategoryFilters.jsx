import React from 'react';

const CategoryFilters = () => {
  // We'll use a simple array for the filter names for now
  const categories = ['Popular', 'Music', 'Streaming', 'AI & Productivity', 'Software', 'Education'];

  return (
    <div className="flex space-x-3 overflow-x-auto pb-4">
      {categories.map((category, index) => (
        <button
          key={category}
          className={`py-2 px-5 rounded-full font-semibold text-sm flex-shrink-0 transition-colors
            ${index === 0
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' // Active state
              : 'bg-[#1e2947] text-slate-300 hover:bg-slate-700' // Inactive state
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilters;