import React from "react";
import { useLocation, Link } from "react-router-dom";

const navItems = [
  {
    label: "Wallet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <rect x="2" y="7" width="20" height="13" rx="4" />
        <path d="M2 7V6a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v1" />
        <circle cx="18" cy="15" r="1.5" fill="currentColor" />
      </svg>
    ),
    path: "/wallet"
  },
  {
    label: "Friends",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M3 20c0-4 10-4 10 0" />
        <path d="M14 19c0-2 4-2 4 0" />
      </svg>
    ),
    path: "/friends"
  },
  {
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <path d="M3 10L12 3l9 7" />
        <rect x="5" y="10" width="14" height="9" rx="2" />
        <path d="M9 21V13h6v8" />
      </svg>
    ),
    path: "/"
  },
  {
    label: "Subscription",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <rect x="3" y="7" width="18" height="13" rx="4" />
        <path d="M3 7V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v1" />
        <path d="M8 13h8" />
        <path d="M8 17h8" />
      </svg>
    ),
    path: "/subscription"
  },
];

export default function BottomNavBar() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      left: '50%',
      bottom: '20px',
      transform: 'translateX(-50%)',
      width: '90vw',
      maxWidth: '420px',
      height: '64px',
      background: 'rgba(255,255,255,0.75)',
      borderRadius: '22px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(220,220,220,.65)'
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/");
        return (
          <Link
            key={item.label}
            to={item.path}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              height: '56px',
              borderRadius: '16px',
              color: isActive ? '#006cff' : '#9099a5',
              fontSize: '0.92em',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              background: isActive ? 'rgba(0, 108, 255, 0.14)' : 'transparent',
              boxShadow: isActive ? '0 2px 8px rgba(0,108,255,0.09)' : 'none',
              gap: '4px',
              transition: 'color 0.2s, background 0.2s'
            }}
          >
            <span
              style={{
                width: '26px',
                height: '26px',
                marginBottom: '2px',
                filter: isActive ? 'none' : 'grayscale(0.3)',
                transition: 'filter 0.2s'
              }}
            >
              {item.icon}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}