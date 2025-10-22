// src/components/BottomNavBar.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Users, Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationContext"; // new hook

// --- navItems ---
const navItems = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Sub's",
    path: "/subscription",
    icon: (props) => (
      <svg
        {...props}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Wallet",
    path: "/wallet",
    icon: (props) => (
      <svg
        {...props}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 7h-9a3 3 0 00-3-3H5a3 3 0 00-3 3v10a3 3 0 003 3h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path d="M17 14h.01" />
      </svg>
    ),
    hideOnMobile: true,
  },
  {
    label: "Explore",
    path: "/explore",
    icon: Compass,
  },
  {
    label: "Buddies",
    path: "/friends",
    icon: Users,
  },
  {
    label: "Inbox",
    path: "/notifications",
    icon: Bell,
  },
];

// --- Notification Dot ---
const NotificationDot = () => (
  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
);

export default function BottomNavBar() {
  const location = useLocation();
  const { unreadCount, friendRequestCount, subUpdatesCount } = useNotifications();

  const [hoveredItem, setHoveredItem] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navRef = useRef(null);

  // --- scroll + hover behavior (restored) ---
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsVisible(false);
        timeoutId = setTimeout(() => setIsVisible(true), 2000);
      }
    };
    const handleMouseMove = (event) => {
      if (window.innerWidth >= 1024) {
        const bottomThreshold = window.innerHeight - 150;
        if (event.clientY > bottomThreshold) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  const handleNavClick = (path) => {
    setClickedItem(path);
    setTimeout(() => setClickedItem(null), 300);
    setIsVisible(true);
  };

  const getNotificationState = (label) => {
    if (label === "Inbox" && unreadCount > 0) return true;
    if (label === "Buddies" && friendRequestCount > 0) return true;
    if (label === "Sub's" && subUpdatesCount > 0) return true;
    return false;
  };

  const filteredNavItems = navItems.filter((item) =>
    window.innerWidth < 1024 ? !item.hideOnMobile : true
  );

  return (
    <>
      {/* --- Mobile Nav --- */}
      <nav
        ref={navRef}
        className={`fixed left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0 bottom-0" : "translate-y-full bottom-0"
        }`}
        style={{ willChange: "transform" }}
      >
        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="relative flex items-center justify-around px-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const showDot = getNotificationState(item.label);
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="relative flex flex-col items-center justify-center w-full max-w-[80px] py-2 px-1 group transition-colors duration-200"
                  aria-label={item.label}
                >
                  <div
                    className={`relative flex items-center justify-center w-12 h-12 transition-transform duration-300 ${
                      isActive
                        ? "scale-100"
                        : "scale-90 group-hover:scale-100"
                    }`}
                  >
                    <IconComponent
                      className={`transition-colors duration-300 ${
                        isActive
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {showDot && <NotificationDot />}
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-[-4px] transition-colors duration-300 ${
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="h-[env(safe-area-inset-bottom,0px)] bg-white dark:bg-gray-900" />
      </nav>

      {/* --- Desktop Nav --- */}
      <nav
        ref={navRef}
        className={`hidden lg:flex fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 bottom-6" : "translate-y-[150%] bottom-6"
        }`}
        style={{ willChange: "transform" }}
        onMouseEnter={() => setIsVisible(true)}
      >
        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 px-3 py-2.5">
          <div className="flex items-center gap-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.path;
              const showDot = getNotificationState(item.label);
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative flex items-center justify-center group transition-all duration-200"
                  aria-label={item.label}
                >
                  <div
                    className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 rounded-full ${
                      isActive
                        ? "bg-purple-100 dark:bg-purple-900/30 scale-100"
                        : "scale-90 group-hover:scale-100"
                    }`}
                  >
                    <IconComponent
                      className={`transition-all duration-300 ${
                        isActive
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {showDot && <NotificationDot />}
                  </div>

                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm font-medium rounded-xl whitespace-nowrap shadow-lg opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-200 fill-mode-forwards pointer-events-none">
                      {item.label}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
