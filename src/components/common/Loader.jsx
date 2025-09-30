import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default Loader;