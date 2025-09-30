import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Eye, Copy, Check, HelpCircle } from 'lucide-react';
import Loader from './Loader';

const JoiningDetails = ({ bookingId }) => {
    const [inviteData, setInviteData] = useState(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvite = async () => {
            setLoading(true);
            const { data } = await supabase.from('invite_link').select('*').eq('booking_id', bookingId).single();
            if (data) {
                setInviteData(data);
                if (data.user_confirmation_status?.status === 'confirmed' || data.user_confirmation_status?.status === 'revealed') {
                    setIsRevealed(true);
                }
            }
            setLoading(false);
        };
        fetchInvite();
    }, [bookingId]);

    const handleReveal = async () => { /* ... (Logic from previous step) ... */ };
    const handleConfirmJoin = async () => { /* ... (Logic from previous step) ... */ };
    const handleCopy = (text) => { /* ... (Logic from previous step) ... */ };

    if (loading) return <Loader />;

    return (
        <section className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 mb-6">
            <h3 className="font-bold text-lg mb-4">Joining Details</h3>
            {!inviteData ? (
                <p className="text-sm text-center text-gray-500 dark:text-slate-400">Your host has not sent the joining details yet.</p>
            ) : (
                !isRevealed ? (
                    <button onClick={handleReveal} className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors">
                        <Eye className="w-5 h-5" /> Reveal Invite Details
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in">
                        {/* ... (Display for invite link, address, and confirmation buttons) ... */}
                    </div>
                )
            )}
        </section>
    );
};

export default JoiningDetails;