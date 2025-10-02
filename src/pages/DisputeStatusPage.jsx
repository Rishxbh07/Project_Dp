import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Stepper, { Step } from '../components/common/Stepper';
import Loader from '../components/common/Loader';
import { ShieldAlert, Inbox } from 'lucide-react';

const DisputeStatusPage = ({ session }) => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeDispute, setActiveDispute] = useState(null);

    const disputeSteps = ['Filed', 'Under Review', 'Settlement', 'Resolved'];

    const getStepIndex = (status) => {
        switch (status.toLowerCase()) {
            case 'open':
                return 0; // Filed
            case 'under_review':
                return 1;
            case 'settlement':
            case 'refund_initiated':
                return 2;
            case 'resolved':
            case 'closed':
                return 3;
            default:
                return 0;
        }
    };

    useEffect(() => {
        const fetchDisputes = async () => {
            if (!session) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('disputes')
                .select(`
                    *,
                    booking:bookings(listing:listings(service:services(name)))
                `)
                .eq('raised_by_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                setError('Failed to load your disputes.');
                console.error(error);
            } else {
                setDisputes(data);
            }
            setLoading(false);
        };

        fetchDisputes();
    }, [session]);

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-center items-center">
                     <Link to="/" className="text-purple-500 absolute left-4">&larr; Back</Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dispute Status</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 pb-24">
                {loading ? <Loader /> : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : disputes.length === 0 ? (
                    <div className="text-center py-24 px-4">
                        <Inbox className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">No Disputes Filed</h3>
                        <p className="text-gray-500 dark:text-slate-400 mt-2">You have not filed any disputes yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map(dispute => (
                            <div key={dispute.id}>
                                <button onClick={() => setActiveDispute(activeDispute === dispute.id ? null : dispute.id)} className="w-full text-left p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                Dispute for: {dispute.booking?.listing?.service?.name || 'Service'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                Filed on: {new Date(dispute.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                         <span className={`capitalize text-xs font-semibold px-2 py-1 rounded-full ${
                                            dispute.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                         }`}>
                                             {dispute.status}
                                         </span>
                                    </div>
                                </button>
                                {activeDispute === dispute.id && (
                                     <div className="mt-2 animate-in fade-in">
                                         <Stepper initialStep={getStepIndex(dispute.status)}>
                                             <Step>
                                                 <h3 className="font-bold">Dispute Filed</h3>
                                                 <p className="text-sm text-gray-600 dark:text-slate-300">We have received your dispute and will begin our review shortly.</p>
                                             </Step>
                                             <Step>
                                                 <h3 className="font-bold">Under Review</h3>
                                                 <p className="text-sm text-gray-600 dark:text-slate-300">Our team is actively investigating your case with the host.</p>
                                             </Step>
                                             <Step>
                                                 <h3 className="font-bold">Settlement</h3>
                                                 <p className="text-sm text-gray-600 dark:text-slate-300">A resolution is being processed. This may involve a refund or other actions.</p>
                                             </Step>
                                             <Step>
                                                 <h3 className="font-bold">Resolved</h3>
                                                 <p className="text-sm text-gray-600 dark:text-slate-300">The dispute has been closed. Please check your wallet or plan for updates.</p>
                                             </Step>
                                         </Stepper>
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