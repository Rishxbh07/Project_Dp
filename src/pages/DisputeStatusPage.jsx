// src/pages/DisputeStatusPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader'; // Using your reusable component
import { 
    Inbox, 
    Clock, 
    FileText, 
    User,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const DisputeStatusPage = ({ session }) => {
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchDisputes = async () => {
            if (!session?.user?.id) return;
            setLoading(true);

            const { data, error } = await supabase
                .rpc('get_user_disputes', { p_user_id: session.user.id });

            if (error) {
                console.error(error);
                setError('Failed to load disputes.');
            } else {
                setDisputes(data || []);
            }
            setLoading(false);
        };

        fetchDisputes();
    }, [session]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            
            {/* --- REUSABLE HEADER --- */}
            {/* FIX: Removed explicit path. Default behavior is navigate(-1), which fixes the loop */}
            <PageHeader title="My Disputes" />

            {/* Added pt-20 to account for the fixed header */}
            <main className="max-w-md mx-auto px-4 py-6 pt-20 pb-24">
                
                {/* 48 Hour Guarantee Banner */}
                <div className="bg-blue-600 dark:bg-blue-600 rounded-2xl p-4 shadow-lg mb-6 text-white flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-full shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">We're on it!</h3>
                        <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                            Our support team reviews all disputes within <strong>48 working hours</strong>. 
                            We will notify you once a resolution is reached.
                        </p>
                    </div>
                </div>

                {loading ? <Loader /> : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : disputes.length === 0 ? (
                    <div className="text-center py-24 px-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">No Disputes Found</h3>
                        <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">
                            You haven't raised any disputes yet.
                        </p>
                        <button 
                            onClick={() => navigate('/dispute')}
                            className="mt-6 inline-block bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            Raise a Dispute
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map(dispute => (
                            <div key={dispute.dispute_id} className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm transition-all hover:shadow-md">
                                <button 
                                    onClick={() => setExpandedId(expandedId === dispute.dispute_id ? null : dispute.dispute_id)}
                                    className="w-full text-left p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {dispute.service_name}
                                            </span>
                                            <span className="text-xs font-mono text-gray-400">#{dispute.ticket_number}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">
                                            {new Date(dispute.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`capitalize text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(dispute.status)}`}>
                                            {dispute.status.replace('_', ' ')}
                                        </span>
                                        {expandedId === dispute.dispute_id ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                                    </div>
                                </button>

                                {expandedId === dispute.dispute_id && (
                                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 animate-in fade-in">
                                        <div className="space-y-3 mt-4 text-sm">
                                            <div className="flex gap-3">
                                                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Host</p>
                                                    <p className="text-gray-800 dark:text-gray-200">{dispute.host_username}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Your Notes</p>
                                                    <p className="text-gray-600 dark:text-gray-300 italic">"{dispute.notes}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DisputeStatusPage;