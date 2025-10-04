import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';
import GroupCard from '../../components/admin/GroupCard'; // We will create this next

const GroupManagementPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      
      // This advanced query fetches groups and all their related members and details
      const { data, error } = await supabase
        .from('dapbuddy_groups')
        .select(`
          *,
          members:dapbuddy_group_members (
            *,
            profile:profiles (username, loyalty_score, pfp_url),
            connected_account:connected_accounts (service_uid, profile_link, joined_email),
            subscription:dapbuddy_subscriptions (transaction:transactions(payment_status, expires_on))
          )
        `)
        .order('group_number', { ascending: true });

      if (error) {
        setError('Failed to fetch group data.');
        console.error('Error fetching groups:', error);
      } else {
        setGroups(data);
      }
      setLoading(false);
    };

    fetchGroups();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">DapBuddy Group Management</h1>
      
      {loading ? (
        <div className="flex justify-center p-8"><Loader /></div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="space-y-8">
          {groups.length > 0 ? (
            groups.map(group => <GroupCard key={group.id} group={group} />)
          ) : (
            <p className="text-center text-gray-500 dark:text-slate-400">No groups found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupManagementPage;