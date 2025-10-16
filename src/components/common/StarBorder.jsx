import React from 'react';

const StarBorder = ({
  as: Component = 'div',
  className = '',
  innerClassName = '',
  color = '#A855F7',
  speed = '8s',
  thickness = 1,
  children,
  ...rest
}) => {
  return (
    <Component
      // Added `group` for hover effects and removed `overflow-hidden`
      className={`relative group rounded-2xl ${className}`}
      style={{
        padding: `${thickness}px`,
      }}
      {...rest}
    >
      {/* NEW: Background glow "platform" effect */}
      <div
        className="absolute -inset-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl opacity-10 blur-lg group-hover:opacity-20 group-hover:blur-xl transition-all duration-300"
      />

      {/* Animated rotating gradient border */}
      <div 
        className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
      >
        <div
          className="absolute"
          style={{
            width: '200%',
            height: '200%',
            left: '-50%',
            top: '-50%',
            background: `conic-gradient(from 0deg, transparent 0%, transparent 30%, ${color} 50%, transparent 70%, transparent 100%)`,
            animation: `spin ${speed} linear infinite`,
          }}
        />
      </div>

      {/* MODIFIED: Inner container now has a solid background and a subtle shadow */}
      <div 
        className={`relative z-10 h-full rounded-xl bg-white dark:bg-slate-900 shadow-lg shadow-black/5 ${innerClassName}`}
      >
        {children}
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Component>
  );
};

export default StarBorder;