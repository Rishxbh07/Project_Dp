import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Copy, Check, UserX, ShieldCheck, RefreshCw } from 'lucide-react';

// A simple component for displaying a row of details with a copy button
const DetailRow = ({ label, value }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-3 gap-x-2 items-center text-sm py-1">
            <span className="text-gray-500 dark:text-slate-400 col-span-1 text-left">{label}:</span>
            <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="font-semibold truncate text-gray-800 dark:text-slate-200">{value || 'Not Provided'}</span>
                {value && (
                    <button onClick={handleCopy} className="text-gray-400 hover:text-purple-500">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
};

const MemberDetailCard = ({ member, onUpdate }) => {
    // Correctly access the connected account from the nested data structure
    const connectedAccount = member.booking?.connected_accounts?.[0];
    const profile = member.profile;

    const handleAction = async (action) => {
        let updateData = {};
        if (action === 'kick') {
            updateData = { status: 'removed' };
        } else if (action === 'verify') {
            updateData = { status: 'active' };
        }

        const { error } = await supabase
            .from('dapbuddy_group_members')
            .update(updateData)
            .eq('member_id', member.member_id);

        if (error) {
            alert(`Failed to ${action} member: ${error.message}`);
        } else {
            onUpdate(); // Re-fetch the group details to show the updated status
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
            {/* --- TOP SECTION: MEMBER PROFILE (Restored) --- */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {profile.pfp_url ? (
                        <img src={profile.pfp_url} alt={profile.username} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                            {profile.username.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{profile.username}</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Loyalty Score: {profile.loyalty_score}</p>
                    </div>
                </div>
                <span className={`capitalize text-xs font-semibold px-2 py-1 rounded-full ${
                    member.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
                }`}>
                    {member.status.replace(/_/g, ' ')}
                </span>
            </div>

            {/* --- MIDDLE SECTION: MEMBER IDS (Restored) --- */}
            <div className="space-y-2 border-t border-gray-200 dark:border-slate-700 mt-4 pt-3">
                 <h5 className="font-semibold text-md text-gray-700 dark:text-slate-300 mb-2">Member Identifiers</h5>
                <DetailRow label="User ID" value={member.user_id} />
                <DetailRow label="Booking ID" value={member.booking_id} />
                <DetailRow label="Member ID" value={member.member_id} />
            </div>

            {/* --- NEW SECTION: CONNECTED ACCOUNT DETAILS (Correctly Integrated) --- */}
            <div className="space-y-2 border-t border-gray-200 dark:border-slate-700 mt-4 pt-3">
                <h5 className="font-semibold text-md text-gray-700 dark:text-slate-300 mb-2">Connected Account Details</h5>
                {connectedAccount ? (
                    <>
                        <DetailRow label="Profile Name" value={connectedAccount.service_profile_name} />
                        <DetailRow label="Email" value={connectedAccount.joined_email} />
                        <DetailRow label="Service UID" value={connectedAccount.service_uid} />
                        <DetailRow label="Profile URL" value={connectedAccount.profile_link} />
                    </>
                ) : (
                    <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-4">No connected account details found.</p>
                )}
            </div>

             {/* --- BOTTOM SECTION: ADMIN ACTIONS (Restored) --- */}
            <div className="border-t border-gray-200 dark:border-slate-700 mt-4 pt-3 flex gap-2">
                <button onClick={() => handleAction('kick')} className="flex-1 flex items-center justify-center gap-2 text-sm bg-red-500/10 text-red-500 font-semibold py-2 rounded-lg">
                    <UserX className="w-4 h-4" /> Kick
                </button>
                <button onClick={() => handleAction('verify')} className="flex-1 flex items-center justify-center gap-2 text-sm bg-green-500/10 text-green-600 font-semibold py-2 rounded-lg">
                    <ShieldCheck className="w-4 h-4" /> Verify
                </button>
                <button onClick={onUpdate} className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-300">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default MemberDetailCard;