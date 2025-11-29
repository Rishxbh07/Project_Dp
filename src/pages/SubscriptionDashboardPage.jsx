import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ChevronLeft, AlertTriangle, MessageCircle, AlertOctagon } from 'lucide-react'; 
import Modal from '../components/common/Modal';

// Import all the modular components
import PlanHeader from '../components/subscriptiondashboard/PlanHeader';
import PlanPricing from '../components/subscriptiondashboard/PlanPricing';
import SavingsSummary from '../components/subscriptiondashboard/SavingsSummary';
import Rating from '../components/subscriptiondashboard/Rating';

// Note: ReportIssueModal is removed as we now navigate to the dedicated page

import { CommunicationManager } from '../components/subscriptiondashboard/CommunicationManager';

const SubscriptionDashboardPage = ({ session }) => {
    const { bookingId } = useParams(); 
    const navigate = useNavigate();
    
    // State for the RPC "details" (for page display)
    const [bookingDetails, setBookingDetails] = useState(null);
    
    // State for the *full* booking object (for CommunicationManager)
    const [fullBooking, setFullBooking] = useState(null); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Leave Modal States
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveReason, setLeaveReason] = useState('');
    const [isLeaving, setIsLeaving] = useState(false);

    // Chat Modal State
    const [isChatOpen, setIsChatOpen] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!bookingId || !session?.user?.id) return;
        setLoading(true);
        setError('');

        try {
            const { data: details, error: detailsError } = await supabase.rpc('get_subscription_details', {
                p_booking_id: bookingId,
                p_buyer_id: session.user.id
            });

            if (detailsError) throw new Error(detailsError.message || 'Could not load subscription details.');
            
            if (details && details.length > 0) {
                setBookingDetails(details[0]);
            } else {
                throw new Error('Subscription not found or you do not have access.');
            }

            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .select('*, listings(*)') 
                .eq('id', bookingId)
                .eq('buyer_id', session.user.id) 
                .single();

            if (bookingError) throw new Error(bookingError.message || 'Could not load chat data.');
            
            setFullBooking(bookingData);

        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }

    }, [bookingId, session?.user?.id]); 

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleConfirmLeave = async () => {
        setIsLeaving(true);
        try {
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ 
                    status: 'left', 
                    ended_at: new Date().toISOString(),
                    agent_notes: `User Left. Reason: ${leaveReason}` 
                })
                .eq('id', bookingId)
                .eq('buyer_id', session.user.id);

            if (updateError) throw updateError;
            navigate('/subscription'); 
            
        } catch (err) {
            console.error('Error leaving plan:', err);
            alert(`Failed to leave plan: ${err.message}`);
            setIsLeaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error || !bookingDetails) return <p className="text-center text-red-500 mt-8">{error || 'Details not found.'}</p>;

    const { 
        service_name, 
        service_metadata, 
        solo_plan_price, 
        host_name, 
        host_pfp_url, 
        host_rating, 
        plan_rating, 
        monthly_rate, 
        joined_on, 
        next_renewal,
        listing_id 
    } = bookingDetails;
    
    const { user } = session;

    return (
        <>
            <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans">
                {/* --- FIXED HEADER --- */}
                <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300">
                    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                            aria-label="Go back"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        
                        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 dark:text-white truncate max-w-[60%]">
                            {service_name} Family
                        </h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                {/* --- Main Content --- */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 space-y-8">
                    <PlanHeader 
                        serviceName={service_name}
                        serviceMetadata={service_metadata}
                        hostName={host_name}
                        hostPfpUrl={host_pfp_url}
                        hostRating={host_rating}
                        listingRating={plan_rating || 0}
                    />
                    
                    <PlanPricing 
                        price={monthly_rate}
                        joinedAt={joined_on}
                        expiresOn={next_renewal}
                    />
                    
                    <SavingsSummary 
                        soloPrice={solo_plan_price}
                        userPrice={monthly_rate}
                    />

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        {/* Chat Button (Primary) */}
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-bold">Chat with Host</span>
                        </button>

                        {/* Report Problem Button (Secondary) - Navigates to Dispute Page */}
                        <button
                            onClick={() => navigate(`/dispute/${bookingId}`)}
                            className="flex-1 md:flex-none md:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-200"
                        >
                            <AlertOctagon className="w-5 h-5 text-red-500" />
                            <span>Report Problem</span>
                        </button>
                    </div>

                    <Rating bookingId={bookingId} initialRating={plan_rating || 0} />
                    
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                        <button
                        onClick={() => setShowLeaveModal(true)}
                        className="w-full text-center py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                        Leave Plan
                        </button>
                    </div>
                </main>
            </div>

            {/* --- LEAVE MODAL --- */}
            <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
                 <div className="p-1">
                    <div className="flex items-center gap-3 mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <h3 className="text-lg font-bold">Leave Group?</h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-slate-300 mb-6 px-1">
                        Are you sure you want to leave this group? This action cannot be undone and you will lose access immediately.
                    </p>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                            Reason for leaving (optional)
                        </label>
                        <textarea
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                            rows={3}
                            placeholder="e.g., Found a better price, Service no longer needed..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowLeaveModal(false)}
                            disabled={isLeaving}
                            className="flex-1 py-3 font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmLeave}
                            disabled={isLeaving}
                            className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 transition-all transform active:scale-95 flex justify-center items-center"
                        >
                            {isLeaving ? <Loader size="small" color="white" /> : 'Confirm Leave'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* --- CHAT MODAL --- */}
            <Modal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              title={`Communicating with ${host_name}`}
            >
              {fullBooking && user ? (
                <CommunicationManager booking={fullBooking} user={user} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                    <Loader />
                </div>
              )}
            </Modal>
        </>
    );
};

export default SubscriptionDashboardPage;