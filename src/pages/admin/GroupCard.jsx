import React from 'react';
import { Users } from 'lucide-react';
import MemberRow from './MemberRow'; // We will create this next

const GroupCard = ({ group }) => {
  const activeMembers = group.members.filter(m => m.status === 'active' || m.status === 'pending_invite').length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{group.group_identifier}</h2>
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
              <th scope="col" className="px-4 py-3">Actions</th>
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
  );
};

export default GroupCard;