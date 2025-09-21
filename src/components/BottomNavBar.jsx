import React from "react";
import { useLocation, Link } from "react-router-dom";

// Icon components remain the same
const navItems = [
    {
      label: "Home",
      path: "/",
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
      )
    },
    {
      label: "Subscription",
      path: "/subscription",
      icon: (isActive) => (
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
        </svg>
      )
    },
    {
      label: "Wallet",
      path: "/wallet",
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
        </svg>
      )
    },
    {
      label: "Profile", // Changed from Friends to Profile to match your routes
      path: "/profile",
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
      )
    },
];

export default function BottomNavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-700/50 px-4 py-2">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path) && (item.path !== "/" || location.pathname === "/");
              
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group relative flex flex-col items-center justify-center flex-1 py-3 px-2"
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 shadow-lg animate-in fade-in duration-300"></div>
                  )}
                  <div className={`relative z-10 flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <div className={`transition-all duration-300 ${isActive ? 'text-purple-600 dark:text-white drop-shadow-sm' : 'text-gray-500 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-slate-200'}`}>
                      {item.icon(isActive)}
                    </div>
                    <span className={`text-xs font-medium transition-all duration-300 ${isActive ? 'text-purple-600 dark:text-white font-semibold' : 'text-gray-500 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-slate-200'}`}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse shadow-sm"></div>
                  )}
                  <div className="absolute inset-1 rounded-xl bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-95 group-hover:scale-100 transform transition-transform duration-200"></div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-white/80 dark:bg-slate-900/80 h-safe-area-inset-bottom"></div>
    </nav>
  );
}