// src/pages/host-side/MemberManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';
import { ArrowLeft, Calendar, User, Wallet } from 'lucide-react';
import IndividualCredentialSender from '../../components/host/IndividualCredentialSender'; // Assuming this component exists

// Reusable component for displaying key-value pairs
const DetailItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-sm text-slate-400">{label}:</span>
        <span className="font-semibold text-white truncate">{value || 'Not Provided'}</span>
    </div>
);

const MemberManagementPage = ({ session }) => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [credentialRequest, setCredentialRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [serviceFields, setServiceFields] = useState([]); // For the credential sender form

    const fetchData = useCallback(async () => {
        if (!bookingId || !session?.user?.id) return;
        setLoading(true);
        try {
            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .select(`
                    *,
                    listing_id,
                    profiles!inner(*),
                    listings!inner(*, services!inner(*)),
                    connected_accounts(*),
                    transactions ( billing_options, expires_on )
                `)
                .eq('id', bookingId)
                .single();

            if (bookingError) throw new Error(bookingError.message);
            if (session.user.id !== bookingData.listings.host_id) throw new Error("Permission denied.");
            
            setBooking(bookingData);

            // Fetch latest credential request
            const { data: requestData, error: requestError } = await supabase
                .from('credential_requests')
                .select('*')
                .eq('booking_id', bookingId)
                .order('request_created_at', { ascending: false })
                .limit(1);

            if (requestError) console.warn("Could not fetch credential request:", requestError.message);
            setCredentialRequest(requestData?.[0] || null);

            // Dynamically generate form fields from service config
            const config = bookingData.listings.services.host_config?.afterbuy || [];
            setServiceFields(config.map(fieldName => ({
                id: fieldName,
                label: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                type: fieldName.includes('password') ? 'password' : 'text',
                placeholder: `Enter the ${fieldName.replace(/_/g, ' ')}`,
            })));

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [bookingId, session?.user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-900"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!booking) return <p className="text-center text-slate-400 mt-8">Member not found.</p>;

    const user = booking.profiles;
    const connectedAccount = booking.connected_accounts?.[0];
    const latestTransaction = booking.transactions?.[0];
    const service = booking.listings.services;

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-white">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                     <Link to={`/hosted-plan/${booking.listing_id}`} className="text-purple-400 hover:text-purple-300">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <img src={user.pfp_url} alt={user.username} className="w-8 h-8 rounded-full" />
                        <h1 className="text-xl font-bold truncate">Manage {user.username}</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <section className="bg-slate-800/50 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-lg mb-3">User's Submitted Details</h3>
                        {service.sharing_method === 'invite_link' && connectedAccount ? (
                            <div className="space-y-1 divide-y divide-slate-700/50">
                                <DetailItem label="Profile Name" value={connectedAccount.service_profile_name} />
                                <DetailItem label="Email" value={connectedAccount.joined_email} />
                                <DetailItem label="Service UID" value={connectedAccount.service_uid} />
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-4">
                                {service.sharing_method === 'credentials' 
                                    ? "This is a credential-based plan. No details are collected from the user." 
                                    : "User has not submitted their details yet."}
                            </p>
                        )}
                    </section>
                     <section className="bg-slate-800/50 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-lg mb-3">Billing Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                           <div className="bg-slate-900/70 p-4 rounded-lg">
                               <Wallet className="w-6 h-6 mx-auto text-purple-400 mb-2"/>
                               <p className="text-xs text-slate-400">Billing Choice</p>
                               <p className="font-semibold">{latestTransaction?.billing_options || 'N/A'}</p>
                           </div>
                           <div className="bg-slate-900/70 p-4 rounded-lg">
                               <Calendar className="w-6 h-6 mx-auto text-green-400 mb-2"/>
                               <p className="text-xs text-slate-400">Next Renewal</p>
                               <p className="font-semibold">{latestTransaction ? new Date(latestTransaction.expires_on).toLocaleDateString() : 'N/A'}</p>
                           </div>
                        </div>
                    </section>
                </div>

                {/* Right Column */}
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10">
                     <h3 className="font-bold text-lg mb-4">Credential Manager</h3>
                     {credentialRequest ? (
                        <IndividualCredentialSender
                            key={credentialRequest.id} // Add key to force re-render on data change
                            requestId={credentialRequest.id}
                            onSent={fetchData}
                            fieldsConfig={serviceFields}
                            sharingMethod={service.sharing_method}
                            serviceId={service.id}
                            isResend={credentialRequest.request_status === 'sent_to_user'}
                        />
                     ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-400">No credential request found for this user yet.</p>
                        </div>
                     )}
                </div>
            </main>
        </div>
    );
};

export default MemberManagementPage;