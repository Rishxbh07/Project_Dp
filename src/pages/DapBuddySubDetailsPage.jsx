// src/pages/DapBuddySubDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AlertTriangle, LogOut, IndianRupee, Calendar, ShieldCheck } from 'lucide-react';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import DapBuddyJoiningDetails from '../components/common/DapBuddyJoiningDetails'; // <-- IMPORT

const DapBuddySubDetailsPage = ({ session }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id || !session?.user?.id) return;
            setLoading(true);

            const { data, error } = await supabase.rpc('get_dapbuddy_subscription_details', {
                p_booking_id: id,
                p_user_id: session.user.id
            });

            if (error) {
                setError('Could not load subscription details.');
            } else if (data && data.length > 0) {
                setBookingDetails(data[0]);
            } else {
                setError('Subscription not found or you do not have access.');
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id, session]);

    const handleLeavePlan = async () => {
        setShowLeaveModal(false);
        setLoading(true);

        const { error } = await supabase
            .from('dapbuddy_bookings')
            .update({ status: 'left' })
            .eq('booking_id', id);

        if (error) {
            setLoading(false);
            alert('Could not leave the plan.');
        } else {
            navigate('/subscription');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error || !bookingDetails) return <p className="text-center text-red-500 mt-8">{error || 'Details not found.'}</p>;

    return (
        <>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                        <Link to="/subscription" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                            ← Back
                        </Link>
                        <h1 className="text-xl font-bold">{bookingDetails?.service_name || 'Details'}</h1>
                        <div className="w-16"></div>
                    </div>
                </header>
                <main className="max-w-md mx-auto px-4 py-6 pb-24">
                    <section className="flex flex-col items-center text-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white mb-3 shadow-lg">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DapBuddy Official</h2>
                        <p className="text-sm text-purple-500 dark:text-purple-400 font-semibold">Verified & Managed Plan</p>
                    </section>

                    <section className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 mb-6 space-y-4">
                        <div className="text-center border-b border-gray-200 dark:border-white/10 pb-4">
                            <p className="text-4xl font-bold text-purple-500 dark:text-purple-400 flex items-center justify-center"><IndianRupee className="w-7 h-7" />{bookingDetails.monthly_rate}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">per month</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined On</p>
                                <p className="font-semibold text-gray-800 dark:text-white mt-1">{new Date(bookingDetails.joined_on).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Next Renewal</p>
                                <p className="font-semibold text-gray-800 dark:text-white mt-1">{new Date(bookingDetails.next_renewal).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </section>

                    {/* --- ADDED JOINING DETAILS SECTION --- */}
                    <DapBuddyJoiningDetails bookingId={id} />
                    
                    <section className="space-y-3">
                        <button onClick={() => setShowLeaveModal(true)} className="w-full text-left bg-red-500/10 flex items-center p-4 rounded-lg hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-5 h-5 mr-4 text-red-500 dark:text-red-400" />
                            <span className="font-semibold text-red-500 dark:text-red-400">Leave Plan</span>
                        </button>
                    </section>
                </main>
            </div>
            
            <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                        If you leave this plan, you will lose access at the end of your billing period.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => setShowLeaveModal(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleLeavePlan} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
                            Leave Plan
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default DapBuddySubDetailsPage;