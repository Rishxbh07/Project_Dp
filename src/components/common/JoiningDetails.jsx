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
                // If status is already revealed or confirmed, show details immediately
                if (data.user_confirmation_status?.status === 'revealed' || data.user_confirmation_status?.status === 'confirmed') {
                    setIsRevealed(true);
                }
            }
            setLoading(false);
        };
        fetchInvite();
    }, [bookingId]);

    const handleReveal = async () => {
        setIsRevealed(true); // Show details immediately on the UI
        // ** THE FIX IS HERE **
        // Update the database to notify the host in real-time
        if (inviteData && inviteData.user_confirmation_status?.status === 'pending') {
            const newStatus = {
                ...inviteData.user_confirmation_status,
                status: 'revealed',
                revealed_at: new Date().toISOString()
            };
            await supabase.from('invite_link').update({ user_confirmation_status: newStatus }).eq('id', inviteData.id);
        }
    };

    const handleConfirmJoin = async () => {
        const newStatus = {
            ...inviteData.user_confirmation_status,
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from('invite_link').update({ user_confirmation_status: newStatus }).eq('id', inviteData.id).select().single();
        if (!error) {
            setInviteData(data);
        }
    };
    
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

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
                        <div>
                            <label className="text-xs text-gray-500 dark:text-slate-400">Invite Link</label>
                            <a href={inviteData.invite_link} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-purple-500 font-semibold truncate hover:underline">
                                {inviteData.invite_link}
                            </a>
                        </div>
                        {inviteData.address && (
                            <div>
                                <label className="text-xs text-gray-500 dark:text-slate-400">Address</label>
                                <div className="relative">
                                    <input type="text" readOnly value={inviteData.address} className="w-full p-3 pr-10 bg-gray-100 dark:bg-slate-800 rounded-lg font-mono" />
                                    <button onClick={() => handleCopy(inviteData.address)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500">
                                        {copySuccess ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {inviteData.user_confirmation_status?.status !== 'confirmed' ? (
                            <div className="pt-4 border-t border-gray-200 dark:border-white/10 text-center">
                                <h4 className="font-semibold mb-3">Did you join successfully?</h4>
                                <div className="flex gap-4">
                                    <Link to={`/dispute/${bookingId}`} className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-semibold py-2 rounded-lg">
                                        <HelpCircle className="w-4 h-4" /> I have a problem
                                    </Link>
                                    <button onClick={handleConfirmJoin} className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 text-green-600 font-semibold py-2 rounded-lg">
                                        <Check className="w-4 h-4" /> Yes, I'm in!
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-sm text-green-600 dark:text-green-400 font-semibold pt-4 border-t border-gray-200 dark:border-white/10">✓ You have confirmed your access to this plan.</p>
                        )}
                    </div>
                )
            )}
        </section>
    );
};

export default JoiningDetails;