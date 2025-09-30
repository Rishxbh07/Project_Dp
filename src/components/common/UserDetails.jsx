import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserCheck, MessageSquare, Copy, Check } from 'lucide-react';
import Loader from './Loader';
import SendPlanLink from './SendPlanLink';

const UserDetails = ({ booking, listing, service }) => {
    const [inviteData, setInviteData] = useState(null);
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const invitePromise = supabase.from('invite_link').select('*').eq('booking_id', booking.id).single();
            const accountPromise = supabase.from('connected_accounts').select('*').eq('booking_id', booking.id).single();
            const [{ data: inviteRes }, { data: accountRes }] = await Promise.all([invitePromise, accountPromise]);
            setInviteData(inviteRes);
            setConnectedAccount(accountRes);
            setLoading(false);
        };
        fetchData();

        const channel = supabase.channel(`invite-link-${booking.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'invite_link', filter: `booking_id=eq.${booking.id}`}, 
            (payload) => setInviteData(payload.new))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [booking.id]);
    
    const handleCopy = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleHostConfirm = async () => {
        setIsConfirming(true);
        const newStatus = { ...inviteData.host_confirmation_status, status: 'confirmed', confirmed_at: new Date().toISOString() };
        const { data, error } = await supabase.from('invite_link').update({ host_confirmation_status: newStatus }).eq('id', inviteData.id).select().single();
        if (error) alert('Failed to confirm.');
        else setInviteData(data);
        setIsConfirming(false);
    };
    
    if (inviteData?.user_confirmation_status?.status === 'issue_raised') {
        return <SendPlanLink booking={booking} listing={listing} service={service} inviteData={inviteData} onSuccess={setInviteData} />;
    }

    const isUserRevealed = inviteData?.user_confirmation_status?.status === 'revealed' || inviteData?.user_confirmation_status?.status === 'confirmed';
    const isHostConfirmed = inviteData?.host_confirmation_status?.status === 'confirmed';

    if (loading) return <Loader />;

    if (service.sharing_method !== 'invite_link') {
        return (
            <button onClick={() => alert('Chat feature coming soon!')} className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600">
                <MessageSquare className="w-4 h-4" /> Send Details (Chat)
            </button>
        );
    }
    
    if (inviteData) {
        return (
            <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 dark:text-white">Member Status</h4>
                <div className="space-y-2 text-xs p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-green-500">Details sent on {new Date(inviteData.host_confirmation_status.shared_at).toLocaleDateString()}</p>
                    
                    {connectedAccount ? (
                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-slate-700 space-y-2">
                            {/* --- CORRECTED LAYOUT --- */}
                            {connectedAccount.service_profile_name && (
                                <div className="grid grid-cols-3 gap-x-2">
                                    <span className="text-gray-500 col-span-1 text-left">Profile Name:</span> 
                                    <span className="font-semibold col-span-2 text-right truncate">{connectedAccount.service_profile_name}</span>
                                </div>
                            )}
                            {connectedAccount.joined_email && (
                                <div className="grid grid-cols-3 gap-x-2 items-center">
                                    <span className="text-gray-500 col-span-1 text-left">Email:</span>
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <span className="font-semibold truncate">{connectedAccount.joined_email}</span>
                                        <button onClick={() => handleCopy(connectedAccount.joined_email, 'email')} className="text-gray-400 hover:text-purple-500">
                                            {copiedField === 'email' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {connectedAccount.service_uid && (
                                <div className="grid grid-cols-3 gap-x-2 items-center">
                                    <span className="text-gray-500 col-span-1 text-left">Service UID:</span>
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <span className="font-semibold truncate">{connectedAccount.service_uid}</span>
                                        <button onClick={() => handleCopy(connectedAccount.service_uid, 'uid')} className="text-gray-400 hover:text-purple-500">
                                            {copiedField === 'uid' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="pt-2 mt-2 border-t border-gray-200 dark:border-slate-700 text-gray-500">Waiting for user to connect their account...</p>
                    )}
                </div>

                {isHostConfirmed ? (
                    <p className="text-center text-sm text-green-600 dark:text-green-400 font-semibold p-2">✓ You confirmed this user has joined.</p>
                ) : (
                    <>
                        <button onClick={handleHostConfirm} disabled={!isUserRevealed || isConfirming} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <UserCheck className="w-4 h-4" />
                            {isConfirming ? 'Confirming...' : 'Confirm User Has Joined'}
                        </button>
                        {!isUserRevealed && <p className="text-center text-xs text-gray-500 dark:text-slate-400">Button unlocks when user reveals details.</p>}
                    </>
                )}
            </div>
        );
    }

    return <SendPlanLink booking={booking} listing={listing} service={service} inviteData={inviteData} onSuccess={setInviteData} />;
};

export default UserDetails;