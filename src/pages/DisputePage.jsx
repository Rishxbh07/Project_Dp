import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import Loader from '../components/common/Loader.jsx';
import { 
    AlertTriangle, 
    Send, 
    ChevronRight, 
    Calendar, 
    User, 
    ChevronLeft,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

const DisputePage = ({ session }) => {
    const { bookingId: paramBookingId } = useParams();
    const navigate = useNavigate();

    // If param exists, we start with it selected. If not, null (Selection Mode).
    const [selectedBookingId, setSelectedBookingId] = useState(paramBookingId || null);

    // Data State
    const [activeBookings, setActiveBookings] = useState([]);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const disputeReasons = [
        "I did not get access to the plan.",
        "The plan is not as described.",
        "The host is unresponsive.",
        "I was removed from the plan unexpectedly.",
        "Other (please specify in notes)."
    ];

    // --- EFFECT: Load Data based on mode ---
    useEffect(() => {
        const loadData = async () => {
            if (!session?.user?.id) return;
            setLoading(true);
            setError('');

            try {
                if (selectedBookingId) {
                    // --- FLOW A: Specific Booking (Form Mode) ---
                    // 1. Fetch Booking + Host + Service Details
                    // FIXED: Replaced 'created_at' with 'joined_on'
                    const { data: booking, error: bookingError } = await supabase
                        .from('bookings')
                        .select(`
                            *,
                            listing:listings (
                                host_id,
                                service:services (name),
                                profiles (username, pfp_url) 
                            )
                        `)
                        .eq('id', selectedBookingId)
                        .eq('buyer_id', session.user.id)
                        .single();

                    if (bookingError) {
                        console.error("Booking Fetch Error:", bookingError);
                        throw new Error(bookingError.message || "Could not load booking details.");
                    }

                    // 2. Fetch Latest Transaction (for context)
                    const { data: transaction } = await supabase
                        .from('transactions')
                        .select('id, amount, created_at')
                        .eq('booking_id', selectedBookingId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    // Combine data safely (transaction might be null if free/test)
                    setSelectedBookingDetails({
                        ...booking,
                        transaction: transaction || { id: 'N/A', amount: '0' }
                    });

                } else {
                    // --- FLOW B: List Active Bookings (Selection Mode) ---
                    // FIXED: Replaced 'created_at' with 'joined_on' in select and order
                    const { data: bookings, error: listError } = await supabase
                        .from('bookings')
                        .select(`
                            id,
                            joined_on,
                            next_renewal,
                            status,
                            listing:listings (
                                host_id,
                                service:services (name),
                                profiles (username)
                            )
                        `)
                        .eq('buyer_id', session.user.id)
                        .in('status', ['active', 'past_due'])
                        .order('joined_on', { ascending: false }); // Ordered by join date

                    if (listError) throw listError;
                    setActiveBookings(bookings || []);
                }
            } catch (err) {
                console.error("Dispute Page Error:", err);
                setError(err.message || "Something went wrong loading your plans.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedBookingId, session?.user?.id]);


    const handleSubmitDispute = async (e) => {
        e.preventDefault();
        if (!reason) return setError("Please select a reason for the dispute.");
        
        setIsSubmitting(true);
        setError('');

        try {
            const { error: insertError } = await supabase.from('disputes').insert({
                booking_id: selectedBookingId,
                raised_by_id: session.user.id,
                host_id: selectedBookingDetails.listing.host_id,
                reason: reason,
                notes: notes,
                transaction_id: selectedBookingDetails.transaction?.id !== 'N/A' 
                    ? selectedBookingDetails.transaction.id 
                    : null
            });

            if (insertError) throw insertError;

            setSuccess(true);
            // Redirect after delay
            setTimeout(() => navigate('/dispute-status'), 2500);

        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900"><Loader /></div>;

    // --- RENDER: Success State ---
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
                <div className="text-center max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl animate-in zoom-in duration-300 border border-gray-100 dark:border-white/5">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Report Submitted</h2>
                    <p className="text-gray-500 dark:text-slate-400">
                        Our team has received your report. We will review it and get back to you shortly.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => {
                            // If user manually navigated to /dispute and selected an ID, go back to list.
                            // If user came via /dispute/:id, go back to previous page.
                            if (selectedBookingId && !paramBookingId) {
                                setSelectedBookingId(null);
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-slate-300" />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                        {selectedBookingId ? 'Report an Issue' : 'Select a Plan'}
                    </h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                
                {/* --- SELECTION VIEW --- */}
                {!selectedBookingId && (
                    <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-800/30">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                Select the subscription you are facing issues with. We will help you resolve it with the host.
                            </p>
                        </div>

                        {activeBookings.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-500 dark:text-slate-400">No active subscriptions found.</p>
                            </div>
                        ) : (
                            activeBookings.map((booking) => (
                                <button
                                    key={booking.id}
                                    onClick={() => setSelectedBookingId(booking.id)}
                                    className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-purple-500 dark:hover:border-purple-500 transition-all group text-left"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            {/* Service Logo Fallback */}
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-500">
                                                {booking.listing.service.name.charAt(0)}
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-purple-500 transition-colors">
                                                {booking.listing.service.name}
                                            </h3>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                                            booking.status === 'active' 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    
                                    <div className="pl-[52px] space-y-2 text-sm text-gray-500 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>Host: <span className="text-gray-700 dark:text-slate-200 font-medium">{booking.listing.profiles?.username || 'Unknown'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {/* FIXED: Use joined_on */}
                                            <span>
                                                Joined: {booking.joined_on ? new Date(booking.joined_on).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-purple-600 dark:text-purple-400 text-sm font-semibold pl-[52px]">
                                        <span>Report Issue</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}


                {/* --- FORM VIEW --- */}
                {selectedBookingId && selectedBookingDetails && (
                    <div className="animate-in slide-in-from-right-8 duration-300 pb-20">
                        {/* Selected Context Card */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-white/5 mb-6 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Transaction Details</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-xl">
                                        {selectedBookingDetails.listing.service.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                        Host: {selectedBookingDetails.listing.profiles?.username}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ₹{selectedBookingDetails.transaction?.amount}
                                    </p>
                                    <p className="font-mono text-xs text-gray-400 mt-1">
                                        ID: {selectedBookingDetails.transaction?.id?.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitDispute} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 px-1">
                                    What's the issue?
                                </label>
                                <div className="space-y-2">
                                    {disputeReasons.map((r) => (
                                        <label 
                                            key={r}
                                            className={`
                                                flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                                                ${reason === r 
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500 shadow-sm' 
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-slate-600'}
                                            `}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${reason === r ? 'border-purple-500' : 'border-gray-400'}`}>
                                                {reason === r && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                                            </div>
                                            <span className={`text-sm ${reason === r ? 'font-semibold text-purple-900 dark:text-purple-100' : 'text-gray-700 dark:text-slate-300'}`}>
                                                {r}
                                            </span>
                                            <input 
                                                type="radio" 
                                                name="reason" 
                                                value={r} 
                                                checked={reason === r}
                                                onChange={() => setReason(r)}
                                                className="hidden"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 px-1">
                                    Additional Details
                                </label>
                                <textarea
                                    rows="4"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Please describe exactly what happened. The more details, the faster we can resolve this."
                                    className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white placeholder:text-gray-400"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl text-sm flex items-start gap-2 border border-red-100 dark:border-red-800/30">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader size="small" color={isSubmitting ? 'white' : 'black'} /> : (
                                    <>
                                        <span>Submit Report</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DisputePage;