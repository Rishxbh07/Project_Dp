import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MemberRow = ({ member }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile } = member;

  if (!profile) {
    // Render a placeholder or null if profile data is missing
    return (
      <tr>
        <td colSpan="4" className="px-4 py-3 text-sm text-gray-400">Loading member data...</td>
      </tr>
    );
  }

  return (
    <>
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
        <td className="px-4 py-3 capitalize text-xs">
          <span className="font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            {member.status.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-4 py-3">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50 dark:bg-slate-800/50">
          <td colSpan="4" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <h4 className="col-span-full text-sm font-bold mb-2">Member Details</h4>
              <div><span className="font-semibold text-gray-500 dark:text-slate-400">User ID:</span> <span className="font-mono">{member.user_id}</span></div>
              <div><span className="font-semibold text-gray-500 dark:text-slate-400">Member ID:</span> <span className="font-mono">{member.member_id}</span></div>
              <div><span className="font-semibold text-gray-500 dark:text-slate-400">Booking ID:</span> <span className="font-mono">{member.booking_id}</span></div>
              <div><span className="font-semibold text-gray-500 dark:text-slate-400">Joined At:</span> <span className="font-mono">{new Date(member.joined_at).toLocaleString()}</span></div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default MemberRow;