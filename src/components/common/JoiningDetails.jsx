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
            // .maybeSingle() is safer than .single() as it allows for zero rows.
            const { data } = await supabase.from('invite_link').select('*').eq('booking_id', bookingId).maybeSingle();
            if (data) {
                setInviteData(data);
                if (['pending_host_confirmation', 'active', 'mismatch_reported'].includes(data.status)) {
                    setIsRevealed(true);
                }
            }
            setLoading(false);
        };
        fetchInvite();
    }, [bookingId]);

    const handleReveal = async () => {
        if (inviteData && inviteData.status === 'pending_user_reveal') {
            // ** THE FIX IS HERE: Removed .single() from the update call **
            const { data, error } = await supabase
                .from('invite_link')
                .update({ 
                    status: 'pending_host_confirmation',
                    details_revealed_at: new Date().toISOString()
                })
                .eq('id', inviteData.id)
                .select(); // We select to get the updated row back
            
            if (error) {
                alert('Could not update status. Please try again.');
            } else {
                // If data is returned, update the state with the first item
                if (data && data.length > 0) {
                    setInviteData(data[0]);
                }
                setIsRevealed(true);
            }
        } else {
            setIsRevealed(true);
        }
    };

    const handleConfirmJoin = async () => {
        // ** THE FIX IS HERE: Removed .single() from the update call **
        const { data, error } = await supabase
            .from('invite_link')
            .update({ 
                user_join_confirmed_at: new Date().toISOString() 
            })
            .eq('id', inviteData.id)
            .select();

        if (error) {
            alert('Failed to confirm. Please try again.');
        } else {
            if (data && data.length > 0) {
                setInviteData(data[0]);
            }
        }
    };
    
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (loading) return <Loader />;

    // The rest of the component's JSX remains the same
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

                        {!inviteData.user_join_confirmed_at ? (
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