// src/pages/admin/MemberDetailCard.jsx

import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserCheck, ShieldAlert } from 'lucide-react';

const DetailItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-700">
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
        <p className="font-mono text-sm text-gray-800 dark:text-white break-words text-right">{value || 'N/A'}</p>
    </div>
);

const MemberDetailCard = ({ member, onUpdate }) => {
    if (!member || !member.profile) return null;

    const connectedAccount = member.connected_account[0];

    const handleStatusChange = async (newStatus) => {
        const { error } = await supabase
            .from('dapbuddy_group_members')
            .update({ status: newStatus, status_updated_at: new Date().toISOString() })
            .eq('member_id', member.member_id);

        if (error) {
            alert(`Failed to update status: ${error.message}`);
        } else {
            onUpdate();
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-4">
            <div className="flex items-center gap-4">
                {member.profile.pfp_url ? (
                    <img src={member.profile.pfp_url} alt={member.profile.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                        {member.profile.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{member.profile.username}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Loyalty: {member.profile.loyalty_score}</p>
                </div>
            </div>

            <div className="space-y-1 pt-4">
                <DetailItem label="Member ID" value={member.member_identifier} />
                <DetailItem label="Status" value={member.status.replace(/_/g, ' ')} />
                <DetailItem label="User ID" value={member.user_id} />
                <DetailItem label="Booking ID" value={member.booking_id} />
                <DetailItem label="Connected Email" value={connectedAccount?.joined_email} />
                <DetailItem label="Connected UID" value={connectedAccount?.service_uid} />
                <DetailItem label="Profile Name" value={connectedAccount?.service_profile_name} />
                <DetailItem label="Profile Link" value={connectedAccount?.profile_link} />
                <DetailItem label="Created At" value={new Date(connectedAccount?.created_at).toLocaleString()} />
                <DetailItem label="Last Updated" value={new Date(connectedAccount?.updated_at).toLocaleString()} />
            </div>

            <div className="flex gap-2 border-t border-gray-200 dark:border-slate-700 pt-4">
                <button
                    onClick={() => handleStatusChange('active')}
                    className="flex-1 flex items-center justify-center gap-2 text-sm bg-green-500/10 text-green-700 dark:text-green-300 font-semibold py-2 px-4 rounded-lg hover:bg-green-500/20 transition-colors"
                >
                    <UserCheck className="w-4 h-4" /> Confirm
                </button>
                <button
                    onClick={() => handleStatusChange('mismatch_reported')}
                    className="flex-1 flex items-center justify-center gap-2 text-sm bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-500/20 transition-colors"
                >
                    <ShieldAlert className="w-4 h-4" /> Mismatch
                </button>
            </div>
        </div>
    );
};

export default MemberDetailCard;