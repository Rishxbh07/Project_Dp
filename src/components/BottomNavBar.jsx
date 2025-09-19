import React from "react";
import { useLocation, Link } from "react-router-dom";

const navItems = [
  {
    label: "Wallet",
    icon: (isActive) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} width="24" height="24">
        <rect x="2" y="7" width="20" height="13" rx="4" />
        <path d="M2 7V6a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v1" />
        <circle cx="18" cy="15" r="1.5" fill={isActive ? "currentColor" : "none"} />
      </svg>
    ),
    path: "/wallet"
  },
  {
    label: "Friends",
    icon: (isActive) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} width="24" height="24">
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
    icon: (isActive) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} width="24" height="24">
        <path d="M3 10L12 3l9 7" />
        <rect x="5" y="10" width="14" height="9" rx="2" />
        <path d="M9 21V13h6v8" />
      </svg>
    ),
    path: "/"
  },
  {
    label: "Subscription",
    icon: (isActive) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} width="24" height="24">
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
    <nav className="fixed left-1/2 bottom-5 transform -translate-x-1/2 z-50">
      {/* Enhanced nav container with better glassmorphism */}
      <div className="relative">
        
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
        
        {/* Main navigation container */}
        <div
          className="relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl px-6 py-3"
          style={{
            width: '90vw',
            maxWidth: '420px',
            height: '70px',
          }}
        >
          {/* Navigation items */}
          <div className="flex justify-between items-center h-full">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/");
              
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group relative flex flex-col items-center justify-center flex-1 h-full"
                >
                  {/* Active background with smooth animation */}
                  {isActive && (
                    <div className="absolute inset-2 bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg animate-in fade-in duration-300"></div>
                  )}
                  
                  {/* Icon and label container */}
                  <div className={`relative z-10 flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                    isActive ? 'scale-105' : 'group-hover:scale-110'
                  }`}>
                    
                    {/* Enhanced icon with better visual feedback */}
                    <div className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-sm' 
                        : 'text-gray-400 group-hover:text-gray-200'
                    }`}>
                      {item.icon(isActive)}
                    </div>
                    
                    {/* Label with better typography */}
                    <span className={`text-xs font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-white font-semibold' 
                        : 'text-gray-400 group-hover:text-gray-200'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm"></div>
                  )}
                  
                  {/* Hover ripple effect */}
                  <div className="absolute inset-2 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-95 group-hover:scale-100 transform transition-transform duration-200"></div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}