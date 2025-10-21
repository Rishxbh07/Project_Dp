import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';

/**
 * ProfileAvatar
 * - Fetches profile (username, pfp_url) for the session user.
 * - Shows image if present, otherwise first letter fallback.
 * - Small, clickable; does not cause page layout shift.
 */

const ProfileAvatar = ({ session }) => {
  const [profile, setProfile] = useState({ username: '', pfp_url: null });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
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
    return () => { isMounted = false; };
  }, [session]);

  const initial = profile.username ? profile.username.charAt(0).toUpperCase() : (session?.user?.email?.charAt(0).toUpperCase() || '?');

  return (
    <Link to="/profile" aria-label="Profile" className="shrink-0">
      {profile.pfp_url ? (
        <img
          src={profile.pfp_url}
          alt={profile.username || 'Profile'}
          className="w-10 h-10 rounded-full object-cover border-2 border-white/10 shadow-sm"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center border-2 border-white/10 shadow-sm">
          {initial}
        </div>
      )}
    </Link>
  );
};

export default ProfileAvatar;
