// src/pages/SubscriptionDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import JoiningStatusStepper from '../components/common/JoiningStatusStepper';
import JoiningDetailsViewer from '../components/common/JoiningDetailsViewer'; // <-- Import the new viewer
import { ArrowLeft, Star, User, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';

const SubscriptionDetailPage = ({ session }) => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [credentialRequest, setCredentialRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // <-- State for the modal

    const fetchDetails = useCallback(async () => {
        if (!bookingId) return;
        setLoading(true);

        const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select(`*, listings(*, services(*), profiles!listings_host_id_fkey(*)), transactions (billing_options, expires_on)`)
            .eq('id', bookingId)
            .order('created_at', { foreignTable: 'transactions', ascending: false })
            .limit(1, { foreignTable: 'transactions' })
            .single();

        if (bookingError || !bookingData) {
            setError('Could not load subscription details.');
            setLoading(false);
            return;
        }
        setBooking(bookingData);

        const { data: requestData, error: requestError } = await supabase
            .from('credential_requests')
            .select('*')
            .eq('booking_id', bookingId)
            .order('request_created_at', { ascending: false })
            .limit(1);

        setCredentialRequest(requestData ? requestData[0] : null);
        setLoading(false);
    }, [bookingId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    if (loading) { /* ... loading UI ... */ }
    if (error) { /* ... error UI ... */ }
    if (!booking) return null;
    
    // ... (destructuring logic for service, host, etc. remains the same)
    const { listings: listing } = booking;
    const { services: service, profiles: host } = listing;
    const latestTransaction = booking.transactions[0];

    return (
        <>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
                {/* ... Header remains the same ... */}
                 <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link to="/subscription" className="text-purple-500 dark:text-purple-400 flex items-center gap-1 text-sm">
                            <ArrowLeft className="w-4 h-4" /> My Subscriptions
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{service.name}</h1>
                        <div className="w-24"></div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-md">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Joining Status</h3>
                        <JoiningStatusStepper 
                            request={credentialRequest} 
                            onViewDetails={() => setIsDetailsModalOpen(true)} // <-- Open modal on click
                        />
                    </div>
                    {/* ... Right Column with Host & Billing Info remains the same ... */}
                     <div className="space-y-8">
                        <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-md">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-purple-500"/> Host Information</h3>
                            <div className="flex items-center gap-4">
                                {host.pfp_url ? (
                                    <img src={host.pfp_url} alt={host.username} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                        {host.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-slate-200">{host.username}</p>
                                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                                        <Star className="w-4 h-4" />
                                        <span>{host.host_rating.toFixed(1)} Host Rating</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-md">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-green-500"/> Billing Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-slate-400">Subscription Start</span>
                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{new Date(booking.joined_at).toLocaleDateDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><RefreshCw className="w-4 h-4"/> Next Renewal</span>
                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{latestTransaction ? new Date(latestTransaction.expires_on).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-slate-400">Payment Method</span>
                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{latestTransaction?.billing_options || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Render the modal viewer when the state is true */}
            {isDetailsModalOpen && (
                <JoiningDetailsViewer 
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    booking={booking}
                    request={credentialRequest}
                    onStatusChange={fetchDetails} // <-- Pass the refetch function
                />
            )}
        </>
    );
};

export default SubscriptionDetailPage;