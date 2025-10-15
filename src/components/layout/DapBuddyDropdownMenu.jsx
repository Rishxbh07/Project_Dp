import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ChevronRight, X, Search, Sun, Moon, Wrench, ShieldAlert } from 'lucide-react';
import Modal from '../common/Modal';
import Auth from '../Auth';
import { ThemeContext } from '../../context/ThemeContext';

const DapBuddyDropdownMenu = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState({
      username: session?.user?.email?.charAt(0).toUpperCase() || '',
      pfp_url: null
  });

  useEffect(() => {
    const fetchProfileAndAdminStatus = async () => {
      if (session?.user) {
        const [profileRes, adminRes] = await Promise.all([
          supabase.from('profiles').select('username, pfp_url').eq('id', session.user.id).single(),
          supabase.from('admins').select('user_id', { count: 'exact', head: true }).eq('user_id', session.user.id)
        ]);
        
        if (profileRes.data) {
          setProfile(profileRes.data);
        } else if (profileRes.error) {
           console.error('Error fetching profile for dropdown:', profileRes.error);
           setProfile({ username: session.user.email.charAt(0).toUpperCase(), pfp_url: null });
        }

        setIsAdmin(adminRes.count > 0);
      } else {
        setIsAdmin(false);
      }
    };
    fetchProfileAndAdminStatus();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/marketplace/${searchValue.trim().toLowerCase()}`);
    }
  }

  const menuItems = [
    { title: "Your Subscriptions", hasArrow: true, path: "/subscription" },
    { title: "Payment Methods", hasArrow: true, path: "/wallet" },
    { title: "Dispute Status", hasArrow: true, path: "/dispute-status", icon: ShieldAlert },
    { title: "Invite & Earn", hasArrow: true, path: "/invite" }
  ];

  return (
    <>
      <div 
        ref={dropdownRef}
        className="
          relative z-20 flex items-center justify-between 
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
          border-slate-200 dark:border-white/10
          
          /* On mobile, it's a floating, rounded bar with margins */
          mx-4 my-6 rounded-full shadow-lg border

          /* On medium screens and up, it becomes a full-width top bar */
          md:mx-0 md:my-0 md:rounded-none md:shadow-sm md:border-b md:border-t-0 md:border-x-0
        "
      >
        {/* --- FINAL UPGRADE --- */}
        {/* The `py-2` provides vertical padding for mobile. */}
        {/* The `md:py-3` adds MORE vertical padding on medium screens and up for the desktop look. */}
        <div className="flex items-center justify-between w-full px-4 py-2 md:px-6 lg:px-8 md:py-3">
          
          {/* --- Left Section: Hamburger & Desktop Logo --- */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-50 flex h-10 w-10 items-center justify-center"
            >
              {isOpen ? <X className="h-6 w-6 text-slate-800 dark:text-white" /> : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs><linearGradient id="iconGradient" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#A855F7"/><stop offset="1" stopColor="#3B82F6"/></linearGradient></defs>
                  <path d="M4 6H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round"/><path d="M4 12H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round"/><path d="M4 18H20" stroke="url(#iconGradient)" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>
            
            <Link to="/" className="hidden md:block">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">DapBuddy</h1>
            </Link>
          </div>

          {/* --- Center Section: Mobile Logo / Desktop Search --- */}
          <div className="flex-1 flex justify-center px-2 md:px-6">
            <div className="md:hidden">
              <Link to="/">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">DapBuddy</h1>
              </Link>
            </div>
            <form onSubmit={handleSearchSubmit} className="hidden md:block w-full max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for any service like Spotify, Netflix, YouTube..."
                  className="w-full py-2.5 lg:py-3 pl-10 pr-4 bg-slate-100 dark:bg-slate-800 rounded-full border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </form>
          </div>

          {/* --- Right Section --- */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 dark:text-slate-400 md:hidden">
              <Search className="w-5 h-5" />
            </button>

            {session ? (
              <Link to="/profile">
                {profile.pfp_url ? (
                  <img src={profile.pfp_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center border-2 border-purple-500">
                    {profile.username ? profile.username.charAt(0).toUpperCase() : ''}
                  </div>
                )}
              </Link>
            ) : (
              <>
                <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium md:hidden">
                  Sign In
                </button>
                <div className="hidden md:flex items-center gap-2">
                  <button onClick={() => setShowAuthModal(true)} className="px-5 py-2 text-purple-600 dark:text-purple-300 font-semibold text-sm">Log In</button>
                  <button onClick={() => setShowAuthModal(true)} className="px-5 lg:px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium">
                    Sign Up
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- Dropdown Menu --- */}
        {isOpen && (
           <div className="absolute left-4 top-16 md:left-6 md:top-20 w-[350px] max-w-[90vw] p-4 bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-40 animate-in fade-in slide-in-from-top-2">
            {session ? (
              <div>
                {isAdmin && ( <Link to="/admin" className="flex items-center justify-between p-3 rounded-lg text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors mb-2 font-bold"><span className="text-sm flex items-center gap-2"><Wrench className="w-4 h-4" /> Admin Dashboard</span><ChevronRight className="w-4 h-4" /></Link> )}
                {menuItems.map((item, index) => (
                   <Link to={item.path} key={index} className="flex items-center justify-between p-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <span className="text-sm font-medium flex items-center gap-2">{item.icon && <item.icon className="w-4 h-4 text-slate-500" />}{item.title}</span>{item.hasArrow && <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                   </Link>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
                  </div>
                  <button onClick={toggleTheme} className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Please sign in to see your options.</div>
            )}
          </div>
        )}
      </div>
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}><Auth /></Modal>
    </>
  );
};

export default DapBuddyDropdownMenu;