import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Send } from 'lucide-react';

const SendPlanLink = ({ booking, listing, service, inviteData, onSuccess }) => {
    const [inviteLink, setInviteLink] = useState(inviteData?.invite_link || '');
    const [address, setAddress] = useState(inviteData?.address || '');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    const handleSendDetails = async () => {
        setError('');
        if (!inviteLink || !address) {
            setError('Please provide both a valid invite link and an address.');
            return;
        }
        if (!inviteLink.startsWith('http')) {
            setError('Please enter a valid URL for the invite link.');
            return;
        }

        setIsSending(true);
        
        const payload = {
            booking_id: booking.id,
            listing_id: listing.id,
            service_id: service.id,
            host_id: listing.host_id,
            user_id: booking.buyer_id,
            invite_link: inviteLink,
            address: address,
            status: 'pending_user_reveal',
            details_sent_at: new Date().toISOString()
        };

        // ** THE FIX IS HERE: .single() has been removed. **
        // .upsert() followed by .select() returns an array.
        const { data, error: upsertError } = await supabase
            .from('invite_link')
            .upsert(payload, { onConflict: 'booking_id' })
            .select();

        if (upsertError) {
            setError(`Failed to send details: ${upsertError.message}`);
            setIsSending(false); // Keep the form visible on error
        } else {
            // If the upsert is successful, 'data' will be an array with one item.
            // We call onSuccess with that single, new data object.
            if (onSuccess && data && data.length > 0) {
                onSuccess(data[0]);
            }
        }
        // No need to set isSending to false on success, as the component will be unmounted.
    };

    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-white">Send Joining Details</h4>
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <input
                    type="url"
                    placeholder="Paste invite link here..."
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                />
                <textarea
                    placeholder="Enter required address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength="200"
                    className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                
                <button
                    onClick={handleSendDetails}
                    disabled={isSending || !inviteLink || !address}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                    {isSending ? 'Sending...' : 'Send Details'}
                </button>
            </div>
        </div>
    );
};

export default SendPlanLink;