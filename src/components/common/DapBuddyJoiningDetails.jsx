import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { Eye, Copy, Check, ArrowRight } from 'lucide-react';
import Loader from './Loader.jsx';
import RevealWarningModal from './RevealWarningModal.jsx';

const DapBuddyJoiningDetails = ({ bookingId }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRevealed, setIsRevealed] = useState(false);
    const [copySuccessField, setCopySuccessField] = useState(null);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!bookingId) return;
            setLoading(true);

            const { data: memberData, error: memberError } = await supabase
                .from('dapbuddy_group_members')
                .select('group_id')
                .eq('booking_id', bookingId)
                .single();

            if (memberError || !memberData) {
                setLoading(false);
                return;
            }

            const { data: groupData, error: groupError } = await supabase
                .from('dapbuddy_groups')
                .select('master_credentials')
                .eq('group_id', memberData.group_id)
                .single();
            
            if (groupData?.master_credentials) {
                setDetails(groupData.master_credentials);
            }
            
            setLoading(false);
        };
        fetchDetails();
    }, [bookingId]);

    const handleRevealClick = () => {
        const hasSeenWarning = localStorage.getItem('hideRevealWarning');
        if (hasSeenWarning) {
            setIsRevealed(true);
        } else {
            setShowWarning(true);
        }
    };

    const proceedToReveal = () => {
        setShowWarning(false);
        setIsRevealed(true);
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopySuccessField(field);
        setTimeout(() => setCopySuccessField(null), 2000);
    };

    if (loading) return <Loader />;
    if (!details) {
        return (
            <section className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 mb-6 text-center">
                 <p className="text-sm text-gray-500 dark:text-slate-400">Joining details will be available here once assigned by an admin.</p>
            </section>
        )
    }

    return (
        <>
            <RevealWarningModal 
                isOpen={showWarning}
                onClose={() => setShowWarning(false)}
                onAccept={proceedToReveal}
            />
            <section className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 mb-6">
                <h3 className="font-bold text-lg mb-4">Joining Details</h3>
                {!isRevealed ? (
                    <button onClick={handleRevealClick} className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors">
                        <Eye className="w-5 h-5" /> Reveal Details
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in">
                        {details.address && (
                            <div>
                                <label className="text-xs text-gray-500 dark:text-slate-400">Address</label>
                                <div className="relative">
                                    <input type="text" readOnly value={details.address} className="w-full p-3 pr-10 bg-gray-100 dark:bg-slate-800 rounded-lg font-mono text-sm" />
                                    <button onClick={() => handleCopy(details.address, 'address')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500">
                                        {copySuccessField === 'address' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {details.email && (
                            <div>
                                <label className="text-xs text-gray-500 dark:text-slate-400">Login Email/Username</label>
                                <div className="relative">
                                    <input type="text" readOnly value={details.email} className="w-full p-3 pr-10 bg-gray-100 dark:bg-slate-800 rounded-lg font-mono text-sm" />
                                    <button onClick={() => handleCopy(details.email, 'email')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500">
                                        {copySuccessField === 'email' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}
                         {details.invite_link && (
                            <a 
                                href={details.invite_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Join Now <ArrowRight className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                )}
            </section>
        </>
    );
};

export default DapBuddyJoiningDetails;

