import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader'; // Correct path
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Modal from '../components/common/Modal';

// Import all the modular components
import PlanHeader from '../components/subscriptiondashboard/PlanHeader';
import PlanPricing from '../components/subscriptiondashboard/PlanPricing';
import SavingsSummary from '../components/subscriptiondashboard/SavingsSummary';
import Rating from '../components/subscriptiondashboard/Rating';

// --- NEW COMPONENT IMPORTED ---
import { CommunicationManager } from '../components/subscriptiondashboard/CommunicationManager';

const SubscriptionDashboardPage = ({ session }) => {
    const { bookingId } = useParams(); 
    const navigate = useNavigate();
    
    // State for the RPC "details" (for page display)
    const [bookingDetails, setBookingDetails] = useState(null);
    
    // --- FIX: State for the *full* booking object (for CommunicationManager) ---
    const [fullBooking, setFullBooking] = useState(null); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // --- NEW: State for chat modal ---
    const [isChatOpen, setIsChatOpen] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!bookingId || !session?.user?.id) return;
        setLoading(true);
        setError('');

        try {
            // 1. Get the "details" for page display (from RPC)
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

            // --- FIX: 2. Get the *full* booking object for the chat component ---
            // This fetch includes the nested listings object
            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .select('*, listings(*)') // Fetches booking and related listing
                .eq('id', bookingId)
                .eq('buyer_id', session.user.id) // Security check
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

    const handleLeavePlan = async () => {
        // ... (rest of the function is unchanged)
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
    
    // We get the user object *from the session*
    const { user } = session;

    return (
        <>
            <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans">
                {/* --- Header (unchanged) --- */}
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                        <Link to="/subscriptions" className="text-purple-500 dark:text-purple-400">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Your Subscription</h1>
                    </div>
                </header>

                {/* --- Main Content (unchanged) --- */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Chat with Host
                    </button>

                    <Rating bookingId={bookingId} initialRating={plan_rating || 0} />
                    
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="w-full text-center py-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Leave Plan
                    </button>
                </main>
            </div>

            {/* --- LEAVE MODAL (Unchanged) --- */}
            <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
                {/* ... (modal content is unchanged) ... */}
            </Modal>

            {/* --- NEW CHAT MODAL (Corrected) --- */}
            <Modal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              title={`Communicating with ${host_name}`}
            >
              {/* --- FIX ---
                We now check for and pass the `fullBooking` object. 
                This object contains the nested `listings` data that
                CommunicationManager expects, solving the error.
              */}
              {fullBooking && user ? (
                <CommunicationManager booking={fullBooking} user={user} />
              ) : (
                <Loader /> // Show a loader if the full data isn't ready
              )}
            </Modal>
        </>
    );
};

export default SubscriptionDashboardPage;