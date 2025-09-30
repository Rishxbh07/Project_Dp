import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Send, MessageSquare, UserCheck, Loader2 } from 'lucide-react';
import Loader from './Loader';

const UserDetails = ({ booking, listing, service }) => {
    const [inviteData, setInviteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteLink, setInviteLink] = useState('');
    const [address, setAddress] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchInvite = async () => {
            setLoading(true);
            const { data } = await supabase.from('invite_link').select('*').eq('booking_id', booking.id).single();
            if (data) {
                setInviteData(data);
                setInviteLink(data.invite_link);
                setAddress(data.address || '');
            }
            setLoading(false);
        };
        fetchInvite();

        const channel = supabase.channel(`invite-link-${booking.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'invite_link', filter: `booking_id=eq.${booking.id}`}, 
            (payload) => {
                setInviteData(payload.new);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [booking.id]);

    const handleSendDetails = async () => { /* ... (Logic from previous step) ... */ };
    const handleHostConfirm = async () => { /* ... (Logic from previous step) ... */ };
    
    const isUserRevealed = inviteData?.user_confirmation_status?.status === 'revealed' || inviteData?.user_confirmation_status?.status === 'confirmed';
    const isHostConfirmed = inviteData?.host_confirmation_status?.status === 'confirmed';

    if (loading) return <Loader />;

    // View for after details have been sent
    if (inviteData) {
        return (
            <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 dark:text-white">Member Status</h4>
                <div className="space-y-2 text-xs p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                    {/* Display user details */}
                </div>
                {isHostConfirmed ? (
                    <p className="text-center text-sm text-green-600 dark:text-green-400 font-semibold p-2">✓ You confirmed this user has joined.</p>
                ) : (
                    <button onClick={handleHostConfirm} disabled={!isUserRevealed || isSending} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <UserCheck className="w-4 h-4" />
                        {isSending ? 'Confirming...' : 'Confirm User Has Joined'}
                    </button>
                )}
                {!isUserRevealed && !isHostConfirmed && <p className="text-center text-xs text-gray-500 dark:text-slate-400">Confirmation button will unlock when the user reveals the details.</p>}
            </div>
        );
    }

    // View for sending details for the first time
    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-white">Send Joining Details</h4>
            {service.sharing_method === 'invite_link' ? (
                <div className="space-y-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                    {/* ... (input fields and send button) ... */}
                </div>
            ) : (
                <button onClick={() => alert('Chat feature coming soon!')} className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Send Details (Chat)
                </button>
            )}
        </div>
    );
};

export default UserDetails;