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

      try {
        // Securely call the server-side function
        const { data, error } = await supabase.functions.invoke('check-admin-status');
        
        if (error) {
          throw error;
        }

        setIsAdmin(data.isAdmin);
      } catch (e) {
        console.error("Admin check failed:", e);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader /></div>;
  }

  // Pass the session object down to all nested admin routes via context
  return isAdmin ? <Outlet context={{ session }} /> : <Navigate to="/" replace />;
};

export default AdminRequired;