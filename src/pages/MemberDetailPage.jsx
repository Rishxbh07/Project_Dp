import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ArrowLeft, CheckCircle, Eye, Copy, Check, ExternalLink, Calendar, Wallet, User } from 'lucide-react';
import IndividualCredentialSender from '../components/host/IndividualCredentialSender';

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
            <span className="text-gray-500 dark:text-slate-400">{label}:</span>
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

const MemberDetailPage = ({ session }) => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [credentialRequest, setCredentialRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        if (!bookingId || !session?.user?.id) return;

        setLoading(true);

        const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles(*),
                listings(*, services(*)),
                connected_accounts(*),
                transactions (
                    billing_options,
                    expires_on
                )
            `)
            .eq('id', bookingId)
            .order('created_at', { foreignTable: 'transactions', ascending: false })
            .limit(1, { foreignTable: 'transactions' })
            .single();

        if (bookingError || !bookingData) {
            setError('Could not load member details.');
            console.error(bookingError);
            setLoading(false);
            return;
        }

        if (session.user.id !== bookingData.listings.host_id) {
            setError("You don't have permission to view this page.");
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

        if (requestError) {
            console.warn("Could not fetch credential request:", requestError.message);
        } else {
            setCredentialRequest(requestData[0] || null);
        }

        setLoading(false);
    }, [bookingId, session?.user?.id]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const renderCredentialStatus = () => {
        if (!credentialRequest) {
            return (
                 <div className="p-4 bg-yellow-500/10 rounded-2xl text-center">
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-300">No credential requests found for this user yet.</p>
                 </div>
            );
        }

        const { status, request_reason, seen_at, confirmed_at } = credentialRequest;

        if (status === 'pending_host') {
            return (
                <div>
                     <p className="text-sm text-center text-gray-500 dark:text-slate-400 mb-3">
                        This user requires joining details. Reason: <span className="font-semibold">{request_reason || 'Initial request'}</span>
                     </p>
                    <IndividualCredentialSender
                        requestId={credentialRequest.id}
                        onSent={fetchData}
                    />
                </div>
            );
        }

        if (status === 'sent_to_user') {
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
                </div>
            )
        }

        if (status === 'resolved') {
             return (
                <div className="text-center p-3 bg-green-500/10 rounded-lg text-sm font-semibold text-green-600 dark:text-green-300">
                    User has confirmed access. All set!
                </div>
            );
        }

        return <p>Status: {status}</p>;
    }


    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!booking) return null;

    const { profiles: user, connected_accounts, transactions } = booking;
    const latestTransaction = transactions[0];
    const connectedAccount = connected_accounts;
    const joinDate = new Date(booking.joined_at);
    const payoutDate = new Date(joinDate);
    payoutDate.setDate(joinDate.getDate() + 31);

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
                <div className="space-y-6">
                    <section className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center gap-4">
                        {user.pfp_url ? (
                            <img src={user.pfp_url} alt={user.username} className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Joined on {new Date(booking.joined_at).toLocaleDateString()}</p>
                        </div>
                    </section>

                    <section className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">User's Account Details</h3>
                        {connectedAccount ? (
                            <div className="space-y-2 text-sm divide-y divide-gray-200 dark:divide-white/10">
                                <DetailItem label="Profile Name" value={connectedAccount.service_profile_name} />
                                {connectedAccount.joined_email && <DetailItem label="Email" value={connectedAccount.joined_email} />}
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
                            <p className="text-center text-gray-500 dark:text-slate-400 p-4">
                                User has not submitted their details yet.
                            </p>
                        )}
                    </section>
                </div>

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
                               <p className="font-bold text-gray-800 dark:text-slate-200">{latestTransaction?.billing_options || 'N/A'}</p>
                           </div>
                           <div className="bg-gray-100 dark:bg-slate-800/50 p-4 rounded-lg">
                               <Calendar className="w-6 h-6 mx-auto text-green-500 mb-2"/>
                               <p className="text-xs text-gray-500 dark:text-slate-400">Next Renewal</p>
                               <p className="font-bold text-gray-800 dark:text-slate-200">{latestTransaction ? new Date(latestTransaction.expires_on).toLocaleDateString() : 'N/A'}</p>
                           </div>
                            <div className="sm:col-span-2 bg-gray-100 dark:bg-slate-800/50 p-4 rounded-lg">
                               <User className="w-6 h-6 mx-auto text-blue-500 mb-2"/>
                               <p className="text-xs text-gray-500 dark:text-slate-400">Next Payout Date</p>
                               <p className="font-bold text-gray-800 dark:text-slate-200">{payoutDate.toLocaleDateString()}</p>
                           </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default MemberDetailPage;