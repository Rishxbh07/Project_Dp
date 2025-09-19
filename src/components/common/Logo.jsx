import React from 'react';

/**
 * Gradient Poppins wordmark component.
 * Uses inline styles for immediate visibility (no build step required).
 */
const Logo = ({ className = '' }) => {
  const style = {
    fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    fontWeight: 800,
    fontSize: '1.25rem', // ~ text-2xl
    lineHeight: 1,
    background: 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.01em',
    display: 'inline-block',
  };

  return (
    <div className={`Logo-wrapper ${className}`}>
      <h1 style={style} className="select-none">dapBuddy</h1>
    </div>
  );
};

export default Logo;