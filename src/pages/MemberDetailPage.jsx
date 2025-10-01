import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, UserCheck, Send, Copy, Check } from 'lucide-react';

// Helper component for copying details
const DetailItem = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-3 gap-x-2 items-center">
            <span className="text-gray-500 dark:text-slate-400 col-span-1 text-left">{label}:</span>
            <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{value || 'Not Provided'}</span>
                {value && (
                    <button onClick={handleCopy} className="text-gray-400 hover:text-purple-500">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
};

// Helper component for the Send Invite form
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
            host_link_send_status: 'sent' // THE FIX: Set the new status flag to 'sent'
        }, { onConflict: 'booking_id' });

        if (upsertError) {
            setError(upsertError.message);
            setIsSending(false);
        } else {
            onSuccess();
        }
    };
    
    return (
         <div className="space-y-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Send Joining Details</h3>
            <input type="url" placeholder="Paste invite link here..." value={inviteLink} onChange={(e) => setInviteLink(e.target.value)} className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            <textarea placeholder="Enter required address..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleSend} disabled={isSending} className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
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
                connected_accounts(*)
            `)
            .eq('id', bookingId)
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

    const handleAction = async (newStatus) => {
        setLoading(true);
        const { error } = await supabase
            .from('invite_link')
            .update({ status: newStatus })
            .eq('booking_id', bookingId);
        
        if (error) alert("Failed to update status.");
        fetchData();
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!booking) return null;

    const { profiles: user, invite_link, connected_accounts } = booking;
    const inviteData = (invite_link && invite_link.length > 0) ? invite_link[0] : null;
    const connectedAccount = (connected_accounts && connected_accounts.length > 0) ? connected_accounts[0] : null;
    const status = inviteData?.status || 'pending_host_invite';

    // THE FIX: The logic is now extremely simple.
    // We check our new database field to decide what to show.
    const hasHostSentDetails = inviteData?.host_link_send_status === 'sent';

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
                    {user.pfp_url ? <img src={user.pfp_url} alt={user.username} className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">{user.username.charAt(0).toUpperCase()}</div>}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Joined on {new Date(booking.joined_at).toLocaleDateString()}</p>
                    </div>
                </section>

                {!hasHostSentDetails ? (
                    <SendInviteForm booking={booking} onSuccess={fetchData} />
                ) : (
                    <>
                        <section className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 space-y-2 text-sm">
                             <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">User's Account Details</h3>
                             {connectedAccount ? (
                                <div className="space-y-2">
                                    {connectedAccount.service_profile_name && <DetailItem label="Profile Name" value={connectedAccount.service_profile_name} />}
                                    {connectedAccount.joined_email && <DetailItem label="Email" value={connectedAccount.joined_email} />}
                                    {connectedAccount.service_uid && <DetailItem label="Service UID" value={connectedAccount.service_uid} />}
                                </div>
                             ) : (
                                <p className="text-center text-gray-500 dark:text-slate-400 p-4">User has not submitted their details yet.</p>
                             )}
                        </section>
                        
                        <section className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Host Actions</h3>
                            {status === 'pending_user_reveal' && <div className="text-center p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300">Waiting for user to reveal details.</div>}
                            {status === 'pending_host_confirmation' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleAction('mismatch_reported_once')} className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-semibold py-2 rounded-lg"><XCircle className="w-4 h-4" /> Mismatch</button>
                                    <button onClick={() => handleAction('active')} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 rounded-lg"><UserCheck className="w-4 h-4" /> Confirm</button>
                                </div>
                            )}
                            {status === 'active' && <div className="text-center p-3 bg-green-500/10 rounded-lg text-sm font-semibold text-green-600 dark:text-green-300">User is confirmed and active.</div>}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default MemberDetailPage;