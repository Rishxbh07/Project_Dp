import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from './common/Loader';

const AdminRequired = ({ session }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // More efficient query to check for existence
      const { count, error } = await supabase
        .from('admins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (error || count === 0) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [session]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader /></div>;
  }

  // FIX: Pass the session object down to all nested admin routes via context
  return isAdmin ? <Outlet context={{ session }} /> : <Navigate to="/" replace />;
};

export default AdminRequired;