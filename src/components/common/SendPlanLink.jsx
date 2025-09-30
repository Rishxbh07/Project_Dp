import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Send } from 'lucide-react';

const SendPlanLink = ({ booking, listing, service, inviteData, onSuccess }) => {
    const [inviteLink, setInviteLink] = useState(inviteData?.invite_link || '');
    const [address, setAddress] = useState(inviteData?.address || '');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [sendSuccess, setSendSuccess] = useState(false);

    const handleSendDetails = async () => {
        setError('');
        setSendSuccess(false);

        const forbiddenPattern = /(call|contact|dm|text|message|msg|whatsapp|telegram|phone|email|gmail|outlook|@|\.com|\.in|\d{7,})/i;
        if (address && forbiddenPattern.test(address)) {
            setError('Address field cannot contain any contact information.');
            return;
        }

        if (!inviteLink.startsWith('http')) {
            setError('Please enter a valid invite link.');
            return;
        }

        if (address.length < 10) {
            setError('Address is too short. Please provide a full, valid address.');
            return;
        }

        setIsSending(true);
        
        const payload = {
            service_id: service.id,
            category: service.category,
            host_id: listing.host_id,
            listing_id: listing.id,
            booking_id: booking.id,
            invite_link: inviteLink,
            address: address,
            user_id: booking.buyer_id,
            host_confirmation_status: {
                ...inviteData?.host_confirmation_status,
                status: 'shared',
                shared_at: new Date().toISOString()
            },
            // Reset user status when host sends new details
            user_confirmation_status: {
                status: 'pending'
            }
        };

        const { data, error: upsertError } = await supabase
            .from('invite_link')
            .upsert(payload, { onConflict: 'booking_id' })
            .select()
            .single();

        if (upsertError) {
            setError('Failed to send details. Please try again.');
        } else {
            setSendSuccess(true);
            onSuccess(data); // Notify the parent component
        }
        setIsSending(false);
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
                />
                <textarea
                    placeholder="Enter required address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength="200"
                    className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                {sendSuccess && <p className="text-xs text-green-500">Details sent successfully!</p>}
                
                <button
                    onClick={handleSendDetails}
                    disabled={isSending || !inviteLink || address.length < 10}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                    {isSending ? 'Sending...' : (inviteData ? 'Send Again' : 'Send Details')}
                </button>
            </div>
        </div>
    );
};

export default SendPlanLink;