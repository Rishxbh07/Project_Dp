import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { AlertTriangle, Send, MessageSquare, HelpCircle } from 'lucide-react';

const DisputePage = ({ session }) => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [transaction, setTransaction] = useState(null); // To store the latest transaction
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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

    useEffect(() => {
        const fetchDetails = async () => {
            if (!bookingId || !session?.user?.id) {
                setError("Invalid session or booking ID.");
                setLoading(false);
                return;
            }

            // Fetch booking details
            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .select(`*, listing:listings(host_id, service:services(name))`)
                .eq('id', bookingId)
                .eq('buyer_id', session.user.id)
                .single();

            if (bookingError) {
                setError("Could not find the booking. You can only raise a dispute for a plan you've joined.");
                setLoading(false);
                return;
            }
            setBooking(bookingData);

            // Fetch the latest transaction for this booking
            const { data: transactionData, error: transactionError } = await supabase
                .from('transactions')
                .select('id')
                .eq('booking_id', bookingId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (transactionError || !transactionData) {
                setError("Could not find an associated transaction. Cannot raise dispute.");
            } else {
                setTransaction(transactionData);
            }

            setLoading(false);
        };

        fetchDetails();
    }, [bookingId, session]);

    const handleSubmitDispute = async (e) => {
        e.preventDefault();
        if (!reason) {
            setError("Please select a reason for the dispute.");
            return;
        }
        if (!transaction) {
            setError("Cannot submit dispute without a valid transaction record.");
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            const { error } = await supabase.from('disputes').insert({
                booking_id: bookingId,
                raised_by_id: session.user.id,
                host_id: booking.listing.host_id,
                reason: reason,
                notes: notes,
                transaction_id: transaction.id, // Use the fetched transaction ID
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => navigate(`/subscription/${bookingId}`), 4000);

        } catch (error) {
            setError(`Failed to submit dispute: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/subscription/${bookingId}`} className="text-purple-500 dark:text-purple-400 text-sm">
                        &larr; Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Raise a Dispute</h1>
                    <div className="w-16"></div>
                </div>
            </header>
            <main className="max-w-md mx-auto px-4 py-6">
                {success ? (
                    <div className="text-center p-8 bg-green-500/10 rounded-2xl">
                        <h2 className="text-2xl font-bold text-green-500 dark:text-green-300">Dispute Submitted!</h2>
                        <p className="text-gray-600 dark:text-slate-300 mt-2">Our support team will review your case and get back to you within 24 hours.</p>
                    </div>
                ) : error && !booking ? (
                     <p className="text-center text-red-500 p-4 bg-red-500/10 rounded-lg">{error}</p>
                ) : (
                    <>
                        <div className="p-4 bg-yellow-500/10 rounded-xl mb-6 text-center">
                             <HelpCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                You are raising a dispute for the <strong>{booking?.listing.service.name}</strong> plan.
                                Please provide as much detail as possible.
                            </p>
                        </div>
                        <form onSubmit={handleSubmitDispute} className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Reason for Dispute *</label>
                                <div className="space-y-2 mt-2">
                                    {disputeReasons.map((r) => (
                                        <button
                                            type="button"
                                            key={r}
                                            onClick={() => setReason(r)}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${reason === r ? 'bg-purple-500/10 border-purple-500' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label htmlFor="notes" className="text-sm font-medium text-gray-500 dark:text-slate-400">Additional Notes</label>
                                <textarea
                                    id="notes"
                                    rows="4"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Provide more details, like when the issue occurred, what you've tried, etc."
                                    className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                ></textarea>
                            </div>

                            {error && <p className="text-red-500 text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                                {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
                            </button>
                        </form>
                    </>
                )}
                {/* Spacer div to prevent content from being hidden by the bottom nav bar */}
                <div className="h-24"></div>
            </main>
        </div>
    );
};

export default DisputePage;