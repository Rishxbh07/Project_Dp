import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, UserCheck, Send, Copy, Check, UserX } from 'lucide-react';

const DetailItem = ({ label, value, noCopy = false, isUpdated = false }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-3 gap-x-2 items-center">
            <div className="col-span-1 text-left flex items-center">
                <span className="text-gray-500 dark:text-slate-400">{label}:</span>
                {/* --- NEW FEATURE --- */}
                {isUpdated && <span className="ml-2 text-xs font-bold text-blue-500">(Updated)</span>}
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{value || 'Not Provided'}</span>
                {value && !noCopy && (
                    <button onClick={handleCopy} className="text-gray-400 hover:text-purple-500">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
};


const SendInviteForm = ({ booking, onSuccess }) => {
    const [inviteLink, setInviteLink] = useState('');
    const [address, setAddress] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async () => {
        if (!inviteLink.startsWith('http') || !address) {
            setError('Please provide a valid link and address.');
            return;
        }
        setIsSending(true);
        const { error: upsertError } = await supabase.from('invite_link').upsert({
            booking_id: booking.id,
            listing_id: booking.listings.id,
            service_id: booking.listings.services.id,
            host_id: booking.listings.host_id,
            user_id: booking.buyer_id,
            invite_link: inviteLink,
            address: address,
            status: 'pending_user_reveal',
            details_sent_at: new Date().toISOString(),
            host_link_send_status: 'sent'
        }, { onConflict: 'booking_id' });

        if (upsertError) {
            setError(upsertError.message);
            setIsSending(false);
        } else {
            await onSuccess();
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Send Joining Details</h3>
            <input
                type="url"
                placeholder="Paste invite link here..."
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
                className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
            />
            <textarea
                placeholder="Enter required address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
                onClick={handleSend}
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send Details'}
            </button>
        </div>
    );
};

const MemberDetailPage = ({ session }) => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        if (!bookingId || !session?.user?.id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles(*),
                listings(*, services(*)),
                invite_link(*),
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

        if (error || !data) {
            setError('Could not load member details.');
            console.error(error);
        } else if (session.user.id !== data.listings.host_id) {
            setError("You don't have permission to view this page.");
        } else {
            setBooking(data);
        }
        setLoading(false);
    }, [bookingId, session.user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (action) => {
        setLoading(true);
        
        const inviteData = Array.isArray(booking.invite_link) ? booking.invite_link[0] : booking.invite_link;

        if (action === 'final_kick') {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'removed' })
                .eq('id', bookingId);
            if (error) alert("Failed to update status.");
        } else {
            if (!inviteData) {
                alert("Could not find invite details to update.");
                setLoading(false);
                return;
            }

            let statusUpdate = {};
            switch (action) {
                case 'confirm':
                    statusUpdate = { status: 'active' };
                    break;
                case 'report_mismatch':
                     if (inviteData.status === 'pending_host_confirmation') {
                        statusUpdate = { status: 'mismatch_reported_once', host_mismatch_reported_at: new Date().toISOString() };
                    } else if (inviteData.status === 'pending_host_confirmation_retry') {
                        statusUpdate = { status: 'human_intervention_required', host_mismatch_reported_at_2: new Date().toISOString() };
                    }
                    break;
                default:
                    setLoading(false);
                    return;
            }
            const { error } = await supabase
                .from('invite_link')
                .update(statusUpdate)
                .eq('id', inviteData.id);

            if (error) alert("Failed to update status.");
        }
        
        await fetchData();
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!booking) return null;

    const { profiles: user, invite_link, connected_accounts, transactions } = booking;
    const latestTransaction = transactions[0];

    const inviteData = Array.isArray(invite_link)
    ? (invite_link.find(link => link.host_link_send_status === 'sent') || invite_link[0] || null)
    : invite_link || null;

    const connectedAccount = connected_accounts;
    const status = inviteData?.status || 'pending_host_invite';
    const hasHostSentDetails = inviteData?.host_link_send_status === 'sent';

    const joinDate = new Date(booking.joined_at);
    const payoutDate = new Date(joinDate);
    payoutDate.setDate(joinDate.getDate() + 31);
    
    let hostActions;
    if (status === 'pending_host_invite') {
        hostActions = <p className="text-center text-gray-500 dark:text-slate-400">Send invite to proceed.</p>;
    } else if (inviteData?.user_join_confirmed_at && status !== 'active') {
        if (status === 'pending_host_confirmation_retry' || status === 'mismatch_reported_once') {
             hostActions = (
                <div>
                    {inviteData.user_details_updated_at && (
                        <p className="text-xs text-center text-gray-500 dark:text-slate-400 mb-3">
                            User updated details on: {new Date(inviteData.user_details_updated_at).toLocaleString()}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleAction('final_kick')} className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-semibold py-2 rounded-lg">
                            <UserX className="w-4 h-4" /> Kick User
                        </button>
                        <button onClick={() => handleAction('confirm')} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 rounded-lg">
                            <UserCheck className="w-4 h-4" /> It's a Match!
                        </button>
                    </div>
                </div>
            );
        } else {
            hostActions = (
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleAction('report_mismatch')} className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/10 text-yellow-600 font-semibold py-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4" /> Report Mismatch
                    </button>
                    <button onClick={() => handleAction('confirm')} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 rounded-lg">
                        <UserCheck className="w-4 h-4" /> Confirm User
                    </button>
                </div>
            );
        }
    } else if (status === 'active') {
        hostActions = (
            <div className="text-center p-3 bg-green-500/10 rounded-lg text-sm font-semibold text-green-600 dark:text-green-300">
                User is confirmed and active.
            </div>
        );
    } else if (status === 'human_intervention_required') {
        hostActions = (
            <div className="text-center p-3 bg-red-500/10 rounded-lg text-sm font-semibold text-red-600 dark:text-red-300">
                This issue has been escalated to support.
            </div>
        );
    }
    else {
        hostActions = (
            <div className="text-center p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300">
                Waiting for user to confirm they have joined.
            </div>
        );
    }
    
    // --- NEW FEATURE: Check if details were recently updated ---
    const wasRecentlyUpdated = inviteData?.user_details_updated_at && (new Date() - new Date(inviteData.user_details_updated_at)) < 5 * 60 * 1000; // 5 minutes

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/hosted-plan/${booking.listing_id}`} className="text-purple-500 dark:text-purple-400 flex items-center gap-1 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Member Details</h1>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-6">
                <section className="flex items-center gap-4">
                    {user.pfp_url ? (
                        <img src={user.pfp_url} alt={user.username} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Joined on {new Date(booking.joined_at).toLocaleDateString()}</p>
                    </div>
                </section>

                <section className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 space-y-2 text-sm">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Billing Information</h3>
                    <DetailItem label="Billing Choice" value={latestTransaction?.billing_options || 'N/A'} noCopy />
                    <DetailItem label="Renewal Date" value={latestTransaction ? new Date(latestTransaction.expires_on).toLocaleDateString() : 'N/A'} noCopy />
                    <DetailItem label="Payout Date" value={payoutDate.toLocaleDateString()} noCopy />
                </section>

                {!hasHostSentDetails ? (
                    <SendInviteForm booking={booking} onSuccess={fetchData} />
                ) : (
                    <>
                        <section className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 space-y-2 text-sm">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">User's Account Details</h3>
                            {connectedAccount ? (
                                <div className="space-y-2">
                                    <DetailItem label="Profile Name" value={connectedAccount.service_profile_name} isUpdated={wasRecentlyUpdated} />
                                    {connectedAccount.joined_email && <DetailItem label="Email" value={connectedAccount.joined_email} isUpdated={wasRecentlyUpdated} />}
                                    {connectedAccount.service_uid && <DetailItem label="Service UID" value={connectedAccount.service_uid} isUpdated={wasRecentlyUpdated} />}
                                    {connectedAccount.profile_link && <DetailItem label="Profile URL" value={connectedAccount.profile_link} isUpdated={wasRecentlyUpdated} />}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-slate-400 p-4">
                                    User has not submitted their details yet.
                                </p>
                            )}
                        </section>

                        <section className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Host Actions</h3>
                            {hostActions}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default MemberDetailPage;