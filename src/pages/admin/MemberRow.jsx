import React from 'react';
import { MoreVertical } from 'lucide-react';

const MemberRow = ({ member }) => {
  const { profile, connected_account, subscription } = member;

  // Safely access nested data
  const paymentStatus = subscription?.transaction[0]?.payment_status || 'N/A';
  const serviceUID = connected_account?.service_uid || connected_account?.joined_email || 'Not Provided';

  return (
    <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
        <div className="flex items-center gap-3">
          {profile.pfp_url ? (
            <img src={profile.pfp_url} alt={profile.username} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div>{profile.username}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Loyalty: {profile.loyalty_score}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs">{member.member_identifier}</td>
      <td className="px-4 py-3 font-mono text-xs truncate max-w-xs">{serviceUID}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          paymentStatus.toLowerCase().includes('paid')
            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
        }`}>
          {paymentStatus}
        </span>
      </td>
      <td className="px-4 py-3 capitalize">{member.status.replace(/_/g, ' ')}</td>
      <td className="px-4 py-3">
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default MemberRow;