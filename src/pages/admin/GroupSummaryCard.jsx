import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Edit, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Modal from '../../components/common/Modal';

const GroupSummaryCard = ({ group, session, onUpdate }) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for the master credentials form
  const [masterEmail, setMasterEmail] = useState(group.master_credentials?.email || '');
  const [masterInvite, setMasterInvite] = useState(group.master_credentials?.invite_link || '');
  const [masterAddress, setMasterAddress] = useState(group.master_credentials?.address || '');

  const members = group.dapbuddy_group_members || [];
  const occupiedSeats = members.filter(m => m.status !== 'left' && m.status !== 'removed').length;
  const adminUsername = group.admin_in_charge?.profile?.username;

  const handleAssignToMe = async () => {
    setIsAssigning(true);
    const { error } = await supabase
      .from('dapbuddy_groups')
      .update({ admin_in_charge_id: session.user.id })
      .eq('group_id', group.group_id);
    if (error) alert('Failed to assign group.');
    onUpdate();
    setIsAssigning(false);
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    const newCredentials = {
        email: masterEmail,
        invite_link: masterInvite,
        address: masterAddress
    };
    const { error } = await supabase
        .from('dapbuddy_groups')
        .update({ master_credentials: newCredentials })
        .eq('group_id', group.group_id);
    
    if (error) alert('Failed to update details.');
    else {
        setIsModalOpen(false);
        onUpdate();
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{group.group_identifier}</h3>
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {adminUsername ? (
              <span>Assigned to: <span className="font-semibold">{adminUsername}</span></span>
            ) : (
              <button onClick={handleAssignToMe} disabled={isAssigning} className="font-semibold text-purple-500 hover:underline disabled:opacity-50">
                {isAssigning ? 'Assigning...' : 'Assign to Me'}
              </button>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-slate-300">
            <p><strong>Email:</strong> {group.master_credentials?.email || 'Not set'}</p>
            <p><strong>Invite:</strong> {group.master_credentials?.invite_link || 'Not set'}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
            <div className='flex items-center justify-end gap-4'>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    group.empty_spots <= 0 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                }`}>
                    {group.empty_spots > 0 ? `${group.empty_spots} empty` : 'Full'}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-slate-300">
                    <Users className="w-4 h-4" />
                    {occupiedSeats} / {group.max_seats}
                </span>
            </div>
            <div className="flex gap-2 mt-2 w-full">
                <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" /> Update
                </button>
                <Link to={`/admin/group/${group.group_id}`} className="flex-1 flex items-center justify-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" /> Manage
                </Link>
            </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleUpdateDetails} className="space-y-4">
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">Update Master Credentials</h3>
            <div>
                <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Master Email</label>
                <input type="email" value={masterEmail} onChange={e => setMasterEmail(e.target.value)} className="w-full p-2 mt-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600"/>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Invite Link</label>
                <input type="text" value={masterInvite} onChange={e => setMasterInvite(e.target.value)} className="w-full p-2 mt-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600"/>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Address</label>
                <input type="text" value={masterAddress} onChange={e => setMasterAddress(e.target.value)} className="w-full p-2 mt-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600"/>
            </div>
            <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-lg">Save Changes</button>
            </div>
        </form>
      </Modal>
    </>
  );
};

export default GroupSummaryCard;