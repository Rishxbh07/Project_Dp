import React from 'react';

/**
 * StarBorder Component - Elegant Rotating Border Effect
 * ------------------------------------------------------------
 * Creates a subtle, sophisticated animated border with soft glowing spots
 */

const StarBorder = ({
  as: Component = 'div',
  className = '',
  innerClassName = '',
  color = '#A855F7',
  speed = '8s',
  thickness = 1.5,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`relative ${className}`}
      style={{ borderRadius: '18px' }}
      {...rest}
    >
      {/* Animated border container */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ 
          borderRadius: '18px',
          padding: `${thickness}px`,
        }}
      >
        {/* First light spot */}
        <div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, 
              transparent 0deg, 
              transparent 60deg,
              ${color}90 85deg,
              ${color} 90deg,
              ${color}90 95deg,
              transparent 120deg, 
              transparent 360deg)`,
            animation: `spin ${speed} linear infinite`,
            borderRadius: '18px',
          }}
        />
        
        {/* Second light spot (opposite side) */}
        <div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 180deg at 50% 50%, 
              transparent 0deg, 
              transparent 60deg,
              ${color}90 85deg,
              ${color} 90deg,
              ${color}90 95deg,
              transparent 120deg, 
              transparent 360deg)`,
            animation: `spin ${speed} linear infinite`,
            borderRadius: '18px',
          }}
        />
        
        {/* Soft glow effect underneath */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${color}20 0%, transparent 50%)`,
            animation: `spin ${speed} linear infinite`,
            filter: 'blur(12px)',
            borderRadius: '18px',
          }}
        />
        
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${color}20 0%, transparent 50%)`,
            animation: `spin ${speed} linear infinite`,
            filter: 'blur(12px)',
            borderRadius: '18px',
          }}
        />
      </div>

      {/* Solid inner content with proper background */}
      <div 
        className={`relative z-10 h-full rounded-2xl ${innerClassName}`}
        style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
          boxShadow: 'inset 0 1px 2px rgba(168, 85, 247, 0.08)',
        }}
      >
        {children}
      </div>
      
      {/* Dark mode background override */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .dark [style*="background: linear-gradient(135deg, rgba(248"] {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%) !important;
          box-shadow: inset 0 1px 2px rgba(168, 85, 247, 0.1) !important;
        }
      `}</style>
    </Component>
  );
};

export default StarBorder;