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

// --- THIS IS THE FIX: Added the missing import for Rating ---
import Rating from '../components/subscriptiondashboard/Rating';

// --- NEW COMPONENT IMPORTED ---
import { CommunicationManager } from '../components/subscriptiondashboard/CommunicationManager';

// --- LEGACY COMPONENTS REMOVED ---
// We no longer import JoiningDetailsViewer or ActionButtons

const SubscriptionDashboardPage = ({ session }) => {
    const { bookingId } = useParams(); 
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // --- NEW: State for chat modal ---
    const [isChatOpen, setIsChatOpen] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!bookingId || !session?.user?.id) return;
        setLoading(true);
        setError('');

        const { data: details, error: detailsError } = await supabase.rpc('get_subscription_details', {
            p_booking_id: bookingId,
            p_buyer_id: session.user.id
        });

        if (detailsError) {
            setError('Could not load subscription details.');
            console.error(detailsError);
        } else if (details && details.length > 0) {
            setBookingDetails(details[0]);
        } else {
            setError('Subscription not found or you do not have access.');
        }
        setLoading(false);
    }, [bookingId, session?.user?.id]); 

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleLeavePlan = async () => {
        setShowLeaveModal(false);
        setLoading(true);
        const { error } = await supabase.from('bookings').update({ status: 'left' }).eq('id', bookingId);
        if (error) {
            setLoading(false);
            alert('Could not leave the plan.');
        } else {
            navigate('/subscriptions');
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
    
    // We get the user object *from the session* (this fixes the AuthContext error)
    const { user } = session;

    return (
        <>
            <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans">
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                        <Link to="/subscriptions" className="text-purple-500 dark:text-purple-400">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Your Subscription</h1>
                    </div>
                </header>

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

                    {/* --- NEW "CHAT WITH HOST" BUTTON --- */}
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Chat with Host
                    </button>

                    {/* --- LEGACY COMPONENTS REMOVED --- */}
                    {/* <JoiningDetailsViewer bookingId={bookingId} /> */}

                    {/* --- RATING COMPONENT (Now imported correctly) --- */}
                    <Rating bookingId={bookingId} initialRating={plan_rating || 0} />
                    
                    {/* --- LEGACY ACTIONBUTTONS REMOVED --- */}

                    {/* --- NEW LEAVE BUTTON (we keep this functionality) --- */}
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
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                        If you leave, your spot will be given to someone else and you will not receive a refund for the current billing period.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => setShowLeaveModal(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleLeavePlan} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
                            Leave Anyways
                        </button>
                    </div>
                </div>
            </Modal>

            {/* --- NEW CHAT MODAL --- */}
            <Modal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              title={`Communicating with ${host_name}`}
            >
              {/* We pass the *full* booking object and the user object */}
              {/* We must check that bookingDetails and user are loaded before rendering */}
              {bookingDetails && user && (
                <CommunicationManager booking={bookingDetails} user={user} />
              )}
            </Modal>
        </>
    );
};

export default SubscriptionDashboardPage;