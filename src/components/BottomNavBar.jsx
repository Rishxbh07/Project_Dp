import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users } from "lucide-react";

const navItems = [
    {
        label: "Home",
        path: "/",
        icon: (isActive) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        )
    },
    {
        label: "Subscription",
        path: "/subscription",
        icon: (isActive) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
            </svg>
        )
    },
    {
        label: "Wallet",
        path: "/wallet",
        icon: (isActive) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7h-9a3 3 0 00-3-3H5a3 3 0 00-3 3v10a3 3 0 003 3h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <path d="M17 14h.01" />
                <path d="M5 7h13" />
            </svg>
        )
    },
    {
        label: "Explore",
        path: "/explore",
        icon: (isActive) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
        )
    },
    {
        label: "Friends",
        path: "/friends",
        icon: (isActive) => <Users strokeWidth={isActive ? 2.5 : 2} />,
    },
    {
        label: "Notifications",
        path: "/notifications",
        icon: (isActive) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
        ),
        hideOnMobile: true,
    },
];

export default function BottomNavBar() {
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [clickedItem, setClickedItem] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const navRef = useRef(null);

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

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('mousemove', handleMouseMove);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [lastScrollY]);

    const handleNavClick = (path) => {
        setClickedItem(path);
        setTimeout(() => setClickedItem(null), 300);
        setIsVisible(true);
    };

    const filteredNavItems = navItems.filter(item => 
        window.innerWidth >= 640 ? true : !item.hideOnMobile
    );

    return (
        <>
            {/* MOBILE: Bottom Navigation Bar */}
            <nav
                ref={navRef}
                className={`fixed left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-out ${
                    isVisible ? 'translate-y-0 bottom-0' : 'translate-y-full bottom-0'
                }`}
                style={{ willChange: 'transform' }}
            >
                <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="relative flex items-center justify-around px-2 py-2">
                        {filteredNavItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const isHovered = hoveredItem === item.path;
                            const isClicked = clickedItem === item.path;
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    onMouseEnter={() => setHoveredItem(item.path)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className="relative flex flex-col items-center justify-center w-full max-w-[80px] py-2 px-1 group transition-all duration-200"
                                    aria-label={item.label}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl" />
                                        </div>
                                    )}
                                    
                                    {isClicked && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-12 h-12 bg-purple-400/20 rounded-full animate-ping" />
                                        </div>
                                    )}
                                    
                                    <div className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'} ${isHovered && !isActive ? 'scale-105' : ''}`}>
                                        <div className={`transition-all duration-300 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                                            {item.icon(isActive)}
                                        </div>
                                        
                                        {isActive && (
                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="h-[env(safe-area-inset-bottom,0px)] bg-white dark:bg-gray-900" />
            </nav>

            {/* DESKTOP: Floating Bottom Navigation Island */}
            <nav
                ref={navRef}
                className={`hidden lg:flex fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
                    isVisible ? 'translate-y-0 bottom-6' : 'translate-y-[150%] bottom-6'
                }`}
                style={{ willChange: 'transform' }}
                onMouseEnter={() => setIsVisible(true)}
            >
                <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 px-3 py-2.5">
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const isHovered = hoveredItem === item.path;
                            const isClicked = clickedItem === item.path;
                            
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
                                    {isActive && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full" />
                                        </div>
                                    )}
                                    
                                    {isClicked && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-14 h-14 bg-purple-400/20 rounded-full animate-ping" />
                                        </div>
                                    )}
                                    
                                    <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'} ${isHovered && !isActive ? 'scale-105' : ''}`}>
                                        <div className={`transition-all duration-300 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                                            {item.icon(isActive)}
                                        </div>
                                    </div>
                                    
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