import React, { useState } from 'react';
import { Users, Edit, ChevronsUpDown } from 'lucide-react';
import MemberRow from './MemberRow';
import Modal from '../../components/common/Modal';
import { supabase } from '../../lib/supabaseClient';

const GroupCard = ({ group, onUpdate }) => {
  const [activeMembers, setActiveMembers] = useState(group.members.filter(m => m.status === 'active' || m.status === 'pending_invite').length);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [masterAccountId, setMasterAccountId] = useState(group.master_account_id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateMasterAccount = async () => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('dapbuddy_groups')
      .update({ master_account_id: masterAccountId })
      .eq('id', group.id);

    if (error) {
      alert('Failed to update master account ID.');
      console.error(error);
    } else {
      onUpdate(); // This will trigger a re-fetch in the parent component
      setIsModalOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{group.group_identifier}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gray-500 dark:text-slate-400">ID: {group.id}</span>
              {group.master_account_id ? (
                <span className="text-xs font-mono text-gray-500 dark:text-slate-400">Master: {group.master_account_id}</span>
              ) : (
                <button onClick={() => setIsModalOpen(true)} className="text-xs font-semibold text-purple-500 hover:underline">
                  Set Master ID
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              group.group_status === 'full' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
              : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
            }`}>
              {group.group_status}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-slate-300">
              <Users className="w-4 h-4" />
              {activeMembers} / {group.max_seats}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700/50 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-4 py-3">Member</th>
                <th scope="col" className="px-4 py-3">Slot</th>
                <th scope="col" className="px-4 py-3">Connected Account</th>
                <th scope="col" className="px-4 py-3">Payment</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3"><ChevronsUpDown className="w-4 h-4" /></th>
              </tr>
            </thead>
            <tbody>
              {group.members.map(member => (
                <MemberRow key={member.id} member={member} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Update Master Account ID</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Enter the master account ID for {group.group_identifier}.</p>
            <input
                type="text"
                value={masterAccountId}
                onChange={(e) => setMasterAccountId(e.target.value)}
                placeholder="Enter Master Account ID"
                className="w-full p-3 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-4 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
                    Cancel
                </button>
                <button onClick={handleUpdateMasterAccount} disabled={isSubmitting} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Updating...' : 'Update'}
                </button>
            </div>
        </div>
      </Modal>
    </>
  );
};

export default GroupCard;