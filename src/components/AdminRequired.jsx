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

      // Check if the user ID exists in the 'admins' table
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single();
      
      if (error || !data) {
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

  // If the user is an admin, render the nested admin routes.
  // Otherwise, redirect them to the homepage.
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRequired;