// src/pages/admin/GroupDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';
import MemberDetailCard from './MemberDetailCard';
import { ArrowLeft } from 'lucide-react';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGroupDetails = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      // Calling the secure RPC function
      const { data, error } = await supabase
        .rpc('get_group_details_for_admin', { p_group_id: groupId })
        .single();

      if (error) throw error;
      setGroup(data);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  if (loading) return <div className="flex justify-center p-8"><Loader /></div>;
  if (error) return <p className="p-4 text-center text-red-500">{error}</p>;
  if (!group) return <p>Group not found.</p>;

  const members = group.dapbuddy_group_members || [];
  const adminUsername = group.admins?.profile?.username;

  return (
    <div>
      <Link to="/admin/groups" className="flex items-center gap-2 text-sm text-purple-500 font-semibold mb-4 hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Group Management
      </Link>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{group.group_identifier}</h1>
        <p className="text-gray-500 dark:text-slate-400">
          {adminUsername ? `Managed by ${adminUsername}` : 'Unassigned'}
        </p>
      </div>

      <div className="space-y-6">
        {members.map(member => (
            <MemberDetailCard key={member.member_id} member={member} onUpdate={fetchGroupDetails} />
        ))}
      </div>
    </div>
  );
};

export default GroupDetailPage;