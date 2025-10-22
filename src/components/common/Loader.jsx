// src/components/common/Loader.jsx
import React from 'react';

// Keyframes for the animation, defined outside the component for clarity
const pulseAnimation = `
  @keyframes dotPulse {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`;

const Loader = () => {
  return (
    <>
      {/* We inject the keyframes animation into the component's style */}
      <style>{pulseAnimation}</style>
      <div className="flex justify-center items-center p-8">
        <div className="flex space-x-2">
          {/* Base styles for each dot */}
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              animation: 'dotPulse 1.5s infinite ease-in-out'
            }}
          ></div>
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              animation: 'dotPulse 1.5s infinite ease-in-out',
              animationDelay: '0.2s'
            }}
          ></div>
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              animation: 'dotPulse 1.5s infinite ease-in-out',
              animationDelay: '0.4s'
            }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default Loader;