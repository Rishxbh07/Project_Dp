// src/pages/RequestStatusPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ChevronRight } from 'lucide-react';
import JoiningDetails from '../components/request-status/JoiningDetails';
import RequestDetails from '../components/request-status/RequestDetails';
import RequestHistory from '../components/request-status/RequestHistory';

const RequestStatusPage = () => {
    const { bookingId } = useParams();
    const [requests, setRequests] = useState([]);
    const [listing, setListing] = useState(null); // State to hold listing info
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPageData = useCallback(async () => {
        if (!bookingId) return;
        setLoading(true);

        // Fetch booking and listing details first
        const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select('*, listings(*)')
            .eq('id', bookingId)
            .single();

        if (bookingError || !bookingData) {
            setError('Could not load booking details.');
            console.error(bookingError);
            setLoading(false);
            return;
        }
        setListing(bookingData.listings);

        // Then fetch credential requests
        const { data: requestsData, error: requestsError } = await supabase
            .from('credential_requests')
            .select('*')
            .eq('booking_id', bookingId)
            .order('request_created_at', { ascending: false });

        if (requestsError) {
            setError('Could not load request history.');
            console.error(requestsError);
        } else {
            setRequests(requestsData);
        }

        setLoading(false);
    }, [bookingId]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;

    const latestRequest = requests.length > 0 ? requests[0] : null;

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 min-h-screen">
            <header className="sticky top-0 z-20 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/subscription/${bookingId}`} className="text-purple-500 hover:text-purple-600 transition-colors p-2 rounded-full">
                        <ChevronRight className="w-6 h-6 transform rotate-180" />
                    </Link>
                    <h1 className="text-xl font-bold">Request Status</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 md:p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-3">Current Status</h2>
                    <JoiningDetails
                        request={latestRequest}
                        bookingId={bookingId}
                        listing={listing}
                        onUpdate={fetchPageData}
                    />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-3">Need Assistance?</h2>
                    <RequestDetails bookingId={bookingId} onUpdate={fetchPageData} disabled={!latestRequest} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-3">History</h2>
                    <RequestHistory requests={requests} />
                </div>
            </main>
        </div>
    );
};

export default RequestStatusPage;