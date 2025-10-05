import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';
import GroupCard from './GroupCard'; // Ensure you are importing GroupCard

const GroupManagementPage = () => {
  const { session } = useOutletContext();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('dapbuddy_groups')
        .select(`
          *,
          admin_in_charge:admins ( profile:profiles ( username ) ),
          dapbuddy_group_members (
            *,
            profile:profiles (username, pfp_url, loyalty_score)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session]);

  if (loading) return <div className="flex justify-center p-8"><Loader /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Group Management</h1>
      
      {error && <p className="p-4 text-center text-red-500 bg-red-100 dark:bg-red-500/20 rounded-lg">{error}</p>}
      
      <div className="space-y-8">
        {groups.length > 0 ? (
          groups.map(group => <GroupCard key={group.group_id} group={group} session={session} onUpdate={fetchGroups} />)
        ) : (
          <p className="text-center text-gray-500 dark:text-slate-400 p-8">No groups found.</p>
        )}
      </div>
    </div>
  );
};

export default GroupManagementPage;