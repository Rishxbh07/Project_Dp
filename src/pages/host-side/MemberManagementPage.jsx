import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';
import { ArrowLeft } from 'lucide-react';

// Import the essential components
import MemberInfoCard from '../../components/host/MemberInfoCard';
import UserSubmittedDetails from '../../components/host/UserSubmittedDetails';
import BillingInfo from '../../components/host/BillingInfo';
import CredentialManager from '../../components/host/CredentialManager';

const MemberManagementPage = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMemberData = useCallback(async () => {
        if (!bookingId) return;
        setLoading(true);

        const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles(*),
                listings(*, services(*)),
                transactions(*),
                connected_accounts(*)
            `)
            .eq('id', bookingId)
            .single();

        if (bookingError) {
            setError('Failed to fetch member details.');
            console.error(bookingError);
            setLoading(false);
            return;
        }
        setBooking(bookingData);

        const { data: requestsData, error: requestsError } = await supabase
            .from('credential_requests')
            .select('*')
            .eq('booking_id', bookingId)
            .order('request_created_at', { ascending: false });

        if (requestsError) {
            console.error('Failed to fetch request history:', requestsError);
        } else {
            setRequests(requestsData);
        }

        setLoading(false);
    }, [bookingId]);

    useEffect(() => {
        fetchMemberData();
    }, [fetchMemberData]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!booking) return <p className="text-center mt-8">Member not found.</p>;

    // --- THIS IS THE FIX ---
    // Safely access the first item of the arrays, or pass null if they're empty.
    const transaction = (booking.transactions && booking.transactions.length > 0) ? booking.transactions[0] : null;
    const connectedAccount = (booking.connected_accounts && booking.connected_accounts.length > 0) ? booking.connected_accounts[0] : null;


    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
            <header className="sticky top-0 z-20 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to={`/host/dashboard/${booking.listing_id}`} className="text-purple-500 dark:text-purple-400">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                        Manage {booking.profiles.username}
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <MemberInfoCard profile={booking.profiles} listing={booking.listings} />
                    <BillingInfo transaction={transaction} />
                </div>

                <div className="md:col-span-2 space-y-6">
                    <UserSubmittedDetails 
                        connectedAccount={connectedAccount} 
                        sharingMethod={booking.listings.services.sharing_method}
                    />
                    <CredentialManager 
                        requests={requests}
                        booking={booking}
                        onUpdate={fetchMemberData}
                    />
                </div>
            </main>
        </div>
    );
};

export default MemberManagementPage;