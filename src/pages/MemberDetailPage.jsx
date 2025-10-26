// src/pages/MemberDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ArrowLeft, CheckCircle, Eye, Copy, Check, ExternalLink, Calendar, Wallet, User } from 'lucide-react';
// Restore the import for IndividualCredentialSender
import IndividualCredentialSender from '../components/host/IndividualCredentialSender';
// Keep the import for validation functions (ensure path is correct)
import { validateAgainstForbiddenWords, validateLanguage, validateInviteLink } from '../components/host/BroadcastDetailsInput';

// DetailItem component remains the same
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

// getServiceFieldsConfig helper function remains the same
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
             setError("Missing booking ID or user session."); // Handle missing params
             setLoading(false);
             return;
        }
        setLoading(true);
        setError('');
        try {
            // Fetch booking, user, listing, service, connection, transaction data
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
                .single(); // Use single() as bookingId is unique

            // --- Robust Error Handling ---
            if (bookingError) throw new Error(`Database error fetching booking: ${bookingError.message}`);
            if (!bookingData) throw new Error('Booking not found.');
            // Ensure related data exists
            if (!bookingData.profiles) throw new Error('User profile data missing.');
            if (!bookingData.listings) throw new Error('Listing data missing.');
            if (!bookingData.listings.services) throw new Error('Service data missing.');

            // Check permissions AFTER confirming data exists
            if (session.user.id !== bookingData.listings.host_id) throw new Error("Permission denied.");

            setBooking(bookingData);
            setServiceFields(getServiceFieldsConfig(bookingData.listings.services.host_config));

            // Fetch the LATEST credential request for this booking
            const { data: requestData, error: requestError } = await supabase
                .from('credential_requests')
                .select('*')
                .eq('booking_id', bookingId)
                .order('request_created_at', { ascending: false })
                .limit(1); // Get only the most recent one

            if (requestError) console.warn("Could not fetch credential request:", requestError.message);
            setCredentialRequest(requestData?.[0] || null); // Set to null if no request found

        } catch (err) {
            setError(err.message);
            console.error("Fetch Data Error:", err); // Log the actual error
        } finally {
            setLoading(false);
        }
    }, [bookingId, session?.user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- RENDER CREDENTIAL STATUS (CORRECTED) ---
    const renderCredentialStatus = () => {
        // Essential data needed before rendering status
        if (loading) return <Loader size="small" />; // Use a smaller loader inline
        if (!booking || !booking.listings || !booking.listings.services) return <p className="text-xs text-red-500">Missing booking/service data.</p>; // Guard clause

        const sharingMethod = booking.listings.services.sharing_method;
        const serviceId = booking.listings.services.id;

        // Case 1: No credential request exists yet
        if (!credentialRequest) {
            // If invite link method, user needs to submit details first (host does nothing yet)
            if (sharingMethod === 'invite_link') {
                return (
                    <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">Waiting for user to submit account details.</p>
                    </div>
                );
            }
            // If credentials method, host needs to send initial details
            else if (sharingMethod === 'credentials') {
                 // --- PROBLEM: We NEED a request ID to send details. The trigger MUST create one. ---
                 // If the trigger failed or didn't run, the host can't send details here easily.
                 // This indicates a potential flaw if the initial trigger isn't guaranteed.
                 // For now, show an error/info message.
                 return (
                     <div className="p-3 bg-red-500/10 rounded-lg text-center">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-300">Error: Cannot send initial details. No request record found. (Check DB trigger)</p>
                     </div>
                 );
            }
            // Fallback for unexpected scenarios
            return (
                 <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-300">No credential request found.</p>
                 </div>
            );
        }

        // Case 2: Credential request exists
        const { id: requestId, status, request_creation_reason, seen_at, confirmed_at } = credentialRequest;

        // --- Crash Fix: Check if status exists before using .replace ---
        const formattedStatus = status ? status.replace(/_/g, ' ') : 'Unknown';

        switch (status) {
            case 'pending_host':
                return (
                    <div>
                        <p className="text-sm text-center text-gray-500 dark:text-slate-400 mb-3">
                            This user requires joining details. Reason: <span className="font-semibold">{request_creation_reason || 'Initial request'}</span>
                        </p>
                        {/* *** CORRECTLY RENDER SENDER *** */}
                        <IndividualCredentialSender
                            requestId={requestId}
                            onSent={fetchData} // Re-fetch data after sending
                            fieldsConfig={serviceFields}
                            sharingMethod={sharingMethod}
                            serviceId={serviceId}
                        />
                    </div>
                );

            case 'sent_to_user':
                return (
                    <div className="p-4 bg-blue-500/10 rounded-2xl space-y-2">
                        <h4 className="font-bold text-blue-600 dark:text-blue-300">Details Sent</h4>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-slate-400">Status:</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200">Waiting for user action</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Eye className="w-4 h-4"/> Seen:</span>
                            <span className={`font-semibold ${seen_at ? 'text-green-500' : 'text-red-500'}`}>{seen_at ? new Date(seen_at).toLocaleString() : 'Not yet'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Confirmed:</span>
                            <span className={`font-semibold ${confirmed_at ? 'text-green-500' : 'text-red-500'}`}>{confirmed_at ? 'Yes' : 'Not yet'}</span>
                        </div>
                        {/* *** CORRECTLY RENDER SENDER FOR RESEND *** */}
                        <div className="pt-2">
                            <IndividualCredentialSender
                                requestId={requestId}
                                onSent={fetchData} // Re-fetch data after sending
                                fieldsConfig={serviceFields}
                                sharingMethod={sharingMethod}
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

            default: // Fallback for any other status
                return (
                    <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Status: <span className="capitalize">{formattedStatus}</span></p>
                    </div>
                );
        }
    };
    // --- END RENDER CREDENTIAL STATUS ---


    // --- MAIN RENDER ---
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    // Show error prominently if fetch failed
    if (error) return <div className="max-w-4xl mx-auto p-4"><p className="text-center text-red-500 mt-8">{error}</p></div>;
    // Guard against rendering before booking data is available
    if (!booking) return <div className="max-w-4xl mx-auto p-4"><p className="text-center text-gray-500 mt-8">Loading booking details...</p></div>;

    // Safely access potentially missing nested data with optional chaining (?.)
    const user = booking.profiles;
    const connected_accounts = booking.connected_accounts; // Might be empty array
    const transactions = booking.transactions; // Might be empty array
    const latestTransaction = transactions?.[0];
    const connectedAccount = connected_accounts?.[0];
    const joinDate = booking.joined_at ? new Date(booking.joined_at) : null;
    const payoutDate = joinDate ? new Date(joinDate) : null;
    if (payoutDate) payoutDate.setDate(joinDate.getDate() + 31); // Example payout calc

    const sharingMethod = booking.listings?.services?.sharing_method; // Get sharing method for conditional rendering

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            {/* Header remains the same */}
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link to={`/hosted-plan/${booking.listing_id}`} className="text-purple-500 dark:text-purple-400 flex items-center gap-1 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Group
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Member Details</h1>
                    <div className="w-24"></div> {/* Spacer */}
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
                            <p className="text-sm text-gray-500 dark:text-slate-400">Joined on {joinDate ? joinDate.toLocaleDateString() : '...'}</p>
                        </div>
                    </section>

                    {/* CORRECTED: Conditionally Render User's Submitted Details */}
                    {sharingMethod === 'invite_link' && (
                        <section className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">User's Submitted Details</h3>
                            {connectedAccount ? (
                                <div className="space-y-1 text-sm divide-y divide-gray-100 dark:divide-slate-700/50">
                                    <DetailItem label="Profile Name" value={connectedAccount.service_profile_name} />
                                    {connectedAccount.joined_email && <DetailItem label="Email" value={connectedAccount.joined_email} copyable />}
                                    {connectedAccount.service_uid && <DetailItem label="Service UID" value={connectedAccount.service_uid} copyable />}
                                    {connectedAccount.profile_link && (
                                        <div className="pt-3">
                                            <a
                                                href={connectedAccount.profile_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 font-semibold py-2 rounded-lg transition-colors"
                                            >
                                                Visit User's Profile <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-gray-500 dark:text-slate-400 pt-3">
                                    User has not submitted their details yet.
                                </p>
                            )}
                        </section>
                    )}
                     {/* Added fallback section if not invite_link */}
                     {sharingMethod !== 'invite_link' && (
                         <section className="p-4 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
                             <p className="text-xs text-center text-gray-500 dark:text-slate-400 flex items-center justify-center gap-1">
                                 <HelpCircle className="w-4 h-4" /> This service uses host-provided credentials. User details are not collected upfront.
                             </p>
                         </section>
                     )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Credential Status & Sending Section */}
                    <section className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Credential Status</h3>
                        {/* This function now correctly includes the sender form */}
                        {renderCredentialStatus()}
                    </section>

                    {/* Billing Info Section */}
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
                            <div className="sm:col-span-2 bg-gray-100 dark:bg-slate-800/50 p-4 rounded-lg">
                               <User className="w-6 h-6 mx-auto text-blue-500 mb-2"/>
                               <p className="text-xs text-gray-500 dark:text-slate-400">Est. Payout Date</p>
                               <p className="font-semibold text-gray-800 dark:text-slate-200">{payoutDate ? payoutDate.toLocaleDateString() : 'N/A'}</p>
                           </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default MemberDetailPage;