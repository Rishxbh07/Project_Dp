// src/components/layout/navbar/Logo.new.jsx
import React from 'react';

const Logo = ({ className = '' }) => {
  const style = {
    fontFamily: "'Zain', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    fontWeight: 800,
    fontSize:'clamp(1.75rem, 0.5rem + 2vw, 2.5rem)', // ✅ UPDATED: 22px → 40px (was 20px → 32px)
    lineHeight: 1,
    background: 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
    display: 'inline-block',
  };

  return (
    <div className={`Logo-wrapper ${className}`}>
      <h1 style={style} className="select-none">dapBuddy</h1>
    </div>
  );
};

export default Logo;