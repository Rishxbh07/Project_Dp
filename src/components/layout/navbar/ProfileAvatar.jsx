// src/components/layout/navbar/ProfileAvatar.jsx
import React, {
  useEffect,
  useState,
  useRef
} from 'react';
import {
  supabase
} from '../../../lib/supabaseClient';
import ProfileDropdownMenu from './ProfileDropdownMenu';

const ProfileAvatar = ({
  session
}) => {
  const [profile, setProfile] = useState({
    username: '',
    pfp_url: null
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      const {
        data,
        error
      } = await supabase
        .from('profiles')
        .select('username, pfp_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return;
      }
      if (isMounted && data) {
        setProfile(data);
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  }

  const initial = profile.username ? profile.username.charAt(0).toUpperCase() : (session?.user?.email?.charAt(0).toUpperCase() || '?');

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} aria-label="Open profile menu" className="shrink-0">
        {/* ✅ PARENT DIV FOR GRADIENT BORDER */}
        <div className="p-0.5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400
                        transition-transform duration-300 ease-in-out hover:scale-110">
          {profile.pfp_url ? (
            <img
              src={profile.pfp_url}
              alt={profile.username || 'Profile'}
              // The white/dark background creates the "gap" effect
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-full object-cover 
                         bg-white dark:bg-slate-900 p-0.5" 
            />
          ) : (
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full 
                            bg-white dark:bg-slate-900 p-0.5">
              <div className="w-full h-full rounded-full
                              bg-gradient-to-br from-purple-600 to-indigo-600 
                              text-white font-bold flex items-center justify-center 
                              text-sm lg:text-base">
                {initial}
              </div>
            </div>
          )}
        </div>
      </button>

      {isDropdownOpen && (
        <ProfileDropdownMenu 
          session={session} 
          profile={profile}
          onClose={closeDropdown} 
        />
      )}
    </div>
  );
};

export default ProfileAvatar;