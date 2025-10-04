import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';
import GroupCard from './GroupCard';

const GroupManagementPage = () => {
  const { session } = useOutletContext();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGroups = async () => {
    if (!session?.user?.id) {
      setError("User session not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: adminList, error: adminError } = await supabase
        .from('admins')
        .select('user_id')
        .order('user_id', { ascending: true });

      if (adminError) throw adminError;
      if (!adminList || adminList.length === 0) throw new Error("No admins configured.");

      const currentAdminId = session.user.id;
      const adminIndex = adminList.findIndex(admin => admin.user_id === currentAdminId);

      if (adminIndex === -1) {
        setGroups([]);
        throw new Error("You are not registered as an admin.");
      }
      
      const totalAdmins = adminList.length;

      // This is the only data fetching call now
      const { data, error } = await supabase.rpc('get_assigned_groups', {
        admin_index: adminIndex,
        total_admins: totalAdmins
      });

      if (error) {
        throw error;
      } else {
        setGroups(data);
      }

    } catch (e) {
      setError(e.message);
      console.error('Error fetching groups:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Assigned Groups</h1>
      
      {error ? (
        <p className="p-4 text-center text-red-500 bg-red-100 dark:bg-red-500/20 rounded-lg">{error}</p>
      ) : (
        <div className="space-y-8">
          {groups.length > 0 ? (
            groups.map(group => <GroupCard key={group.id} group={group} onUpdate={fetchGroups} />)
          ) : (
            <p className="text-center text-gray-500 dark:text-slate-400 p-8">No groups are currently assigned to you.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupManagementPage;