// src/pages/MemberDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ArrowLeft, CheckCircle, Eye, Copy, Check, ExternalLink, Calendar, Wallet, User, HelpCircle } from 'lucide-react';
import IndividualCredentialSender from '../components/host/IndividualCredentialSender';
import { validateAgainstForbiddenWords, validateLanguage, validateInviteLink } from '../components/host/BroadcastDetailsInput';

// DetailItem component for displaying key-value pairs
const DetailItem = ({ label, value, copyable = false }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500 dark:text-slate-400">{label}:</span>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{value || 'Not Provided'}</span>
                {copyable && value && (
                    <button onClick={handleCopy} className="text-gray-400 hover:text-purple-500">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
};

// Helper function to generate form fields from service config
const getServiceFieldsConfig = (serviceConfig) => {
    try {
        const config = typeof serviceConfig === 'string' ? JSON.parse(serviceConfig) : serviceConfig;
        if (!config || !Array.isArray(config.afterbuy)) { return []; }
        return config.afterbuy.map(fieldName => {
            const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return {
                id: fieldName,
                label: label,
                type: fieldName.includes('password') ? 'password' : 'text',
                placeholder: `Enter the ${label}`,
                validation: fieldName.includes('link') ? 'invite_link' : 'text',
            };
        });
    } catch (e) { console.error("Failed to parse host_config:", e); return []; }
};

const MemberDetailPage = ({ session }) => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [credentialRequest, setCredentialRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [serviceFields, setServiceFields] = useState([]);

    const fetchData = useCallback(async () => {
        if (!bookingId || !session?.user?.id) {
             setError("Missing booking ID or user session.");
             setLoading(false);
             return;
        }
        setLoading(true);
        setError('');
        try {
            // Fetch all related data in one go
            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .select(`
                    *,
                    profiles!inner(*),
                    listings!inner(*, services!inner(*)),
                    connected_accounts(*),
                    transactions ( billing_options, expires_on )
                `)
                .eq('id', bookingId)
                .order('created_at', { foreignTable: 'transactions', ascending: false })
                .limit(1, { foreignTable: 'transactions' })
                .single();

            if (bookingError) throw new Error(`Database error fetching booking: ${bookingError.message}`);
            if (!bookingData) throw new Error('Booking not found.');
            if (session.user.id !== bookingData.listings.host_id) throw new Error("Permission denied.");

            setBooking(bookingData);
            setServiceFields(getServiceFieldsConfig(bookingData.listings.services.host_config));

            // Fetch the LATEST credential request for this booking
            const { data: requestData, error: requestError } = await supabase
                .from('credential_requests')
                .select('*')
                .eq('booking_id', bookingId)
                .order('request_created_at', { ascending: false }) // UPDATED: Assumed new column name
                .limit(1);

            if (requestError) console.warn("Could not fetch credential request:", requestError.message);
            setCredentialRequest(requestData?.[0] || null);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [bookingId, session?.user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Renders the current credential status and appropriate actions
    const renderCredentialStatus = () => {
        if (loading) return <Loader size="small" />;
        if (!booking?.listings?.services) return <p className="text-xs text-red-500">Missing service data.</p>;

        const { sharing_method, id: serviceId } = booking.listings.services;

        if (!credentialRequest) {
            if (sharing_method === 'invite_link') {
                return (
                    <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">Waiting for user to submit details.</p>
                    </div>
                );
            }
            return (
                 <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-300">No credential request found.</p>
                 </div>
            );
        }

        // NOTE: I've updated the column names below based on your description.
        // Please verify these match your new table schema.
        const { id: requestId, request_status, request_creation_reason, details_seen_at, confirmed_at } = credentialRequest;
        const status = request_status; // Renaming for clarity
        const seen_at = details_seen_at; // Renaming for clarity

        const formattedStatus = status ? status.replace(/_/g, ' ') : 'Unknown';

        switch (status) {
            case 'pending_host':
                return (
                    <div>
                        <p className="text-sm text-center text-gray-500 dark:text-slate-400 mb-3">
                            User requires joining details. Reason: <span className="font-semibold">{request_creation_reason || 'Initial request'}</span>
                        </p>
                        <IndividualCredentialSender
                            requestId={requestId}
                            onSent={fetchData}
                            fieldsConfig={serviceFields}
                            sharingMethod={sharing_method}
                            serviceId={serviceId}
                        />
                    </div>
                );

            case 'sent_to_user':
                return (
                    <div className="p-4 bg-blue-500/10 rounded-2xl space-y-2">
                        <h4 className="font-bold text-blue-600 dark:text-blue-300">Details Sent</h4>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Eye className="w-4 h-4"/> Seen:</span>
                            <span className={`font-semibold ${seen_at ? 'text-green-500' : 'text-red-500'}`}>{seen_at ? new Date(seen_at).toLocaleString() : 'Not yet'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Confirmed:</span>
                            <span className={`font-semibold ${confirmed_at ? 'text-green-500' : 'text-red-500'}`}>{confirmed_at ? 'Yes' : 'Not yet'}</span>
                        </div>
                        <div className="pt-2">
                            <IndividualCredentialSender
                                requestId={requestId}
                                onSent={fetchData}
                                fieldsConfig={serviceFields}
                                sharingMethod={sharing_method}
                                serviceId={serviceId}
                                isResend={true}
                            />
                        </div>
                    </div>
                );

            case 'resolved':
                return (
                    <div className="text-center p-3 bg-green-500/10 rounded-lg text-sm font-semibold text-green-600 dark:text-green-300">
                        User has confirmed access. All set!
                    </div>
                );

            default:
                return (
                    <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Status: <span className="capitalize">{formattedStatus}</span></p>
                    </div>
                );
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error) return <div className="max-w-4xl mx-auto p-4"><p className="text-center text-red-500 mt-8">{error}</p></div>;
    if (!booking) return <div className="max-w-4xl mx-auto p-4"><p className="text-center text-gray-500 mt-8">Loading booking details...</p></div>;

    const user = booking.profiles;
    const connectedAccount = booking.connected_accounts?.[0];
    const latestTransaction = booking.transactions?.[0];
    const sharingMethod = booking.listings?.services?.sharing_method;

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link to={`/hosted-plan/${booking.listing_id}`} className="text-purple-500 dark:text-purple-400 flex items-center gap-1 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Group
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Member Details</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* User Profile Section */}
                    <section className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center gap-4">
                        {user.pfp_url ? (
                            <img src={user.pfp_url} alt={user.username} className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl">
                                {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username || '...'}</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Joined on {new Date(booking.joined_at).toLocaleDateString()}</p>
                        </div>
                    </section>

                    {/* User's Submitted Details Section */}
                    <section className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">User's Account Details</h3>
                        {sharingMethod === 'invite_link' ? (
                            connectedAccount ? (
                                <div className="space-y-1 text-sm divide-y divide-gray-100 dark:divide-slate-700/50">
                                    <DetailItem label="Profile Name" value={connectedAccount.service_profile_name} />
                                    {connectedAccount.joined_email && <DetailItem label="Email" value={connectedAccount.joined_email} copyable />}
                                    {connectedAccount.service_uid && <DetailItem label="Service UID" value={connectedAccount.service_uid} copyable />}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-gray-500 dark:text-slate-400 pt-3">
                                    User has not submitted their details yet.
                                </p>
                            )
                        ) : (
                             <p className="text-xs text-center text-gray-500 dark:text-slate-400 pt-3 flex items-center justify-center gap-1">
                                 <HelpCircle className="w-4 h-4" /> This service uses host-provided credentials. No details are collected from the user.
                             </p>
                        )}
                    </section>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <section className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Credential Status</h3>
                        {renderCredentialStatus()}
                    </section>

                    <section className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Billing Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                           <div className="bg-gray-100 dark:bg-slate-800/50 p-4 rounded-lg">
                               <Wallet className="w-6 h-6 mx-auto text-purple-500 mb-2"/>
                               <p className="text-xs text-gray-500 dark:text-slate-400">Billing Choice</p>
                               <p className="font-semibold text-gray-800 dark:text-slate-200">{latestTransaction?.billing_options || 'N/A'}</p>
                           </div>
                           <div className="bg-gray-100 dark:bg-slate-800/50 p-4 rounded-lg">
                               <Calendar className="w-6 h-6 mx-auto text-green-500 mb-2"/>
                               <p className="text-xs text-gray-500 dark:text-slate-400">Next Renewal</p>
                               <p className="font-semibold text-gray-800 dark:text-slate-200">{latestTransaction ? new Date(latestTransaction.expires_on).toLocaleDateString() : 'N/A'}</p>
                           </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default MemberDetailPage;