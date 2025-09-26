import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { UserCheck, AlertTriangle, PartyPopper } from 'lucide-react';

const ConnectAccountPage = ({ session }) => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState('form'); // 'form', 'confirmation', 'final'
    const [inputValue, setInputValue] = useState('');
    const [extractedUid, setExtractedUid] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to redirect the user after the final success message
    useEffect(() => {
        if (step === 'final') {
            const timer = setTimeout(() => {
                navigate('/subscription');
            }, 4000); // Redirect after 4 seconds
            return () => clearTimeout(timer);
        }
    }, [step, navigate]);

    // Effect to fetch initial booking information
    useEffect(() => {
        const fetchBookingInfo = async () => {
            if (!bookingId) {
                setError("Booking ID is missing.");
                setLoading(false);
                return;
            }
            const { data, error } = await supabase
                .from('bookings')
                .select(`*, listing:listings(host_id, service:services(name))`)
                .eq('id', bookingId)
                .single();
            if (error) {
                setError("Could not fetch booking details.");
            } else {
                setBooking(data);
            }
            setLoading(false);
        };
        fetchBookingInfo();
    }, [bookingId]);

    // Validates the Spotify URL and extracts the UID in real-time
    const handleUrlInputChange = (url) => {
        setInputValue(url);
        setError('');
        const spotifyRegex = /^(https?:\/\/)?(open\.)?spotify\.com\/user\/([a-zA-Z0-9]+)/;
        const match = url.match(spotifyRegex);
        setExtractedUid(match ? match[3] : null);
    };

    // Moves to the confirmation step without writing to the database
    const handleProceedToConfirmation = (e) => {
        e.preventDefault();
        if (!extractedUid) {
            setError("Please enter a valid Spotify profile URL.");
            return;
        }
        setStep('confirmation');
    };
    
    // **CRITICAL STEP**: This function is only called when the user clicks "Yes".
    // It performs the single, final database insert operation.
    const handleFinalConfirm = async () => {
        if (!extractedUid || !bookingId) {
            setError("Something went wrong. Missing UID or Booking ID.");
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            // The data is only inserted into the database HERE, after final confirmation.
            const { error } = await supabase
                .from('connected_accounts')
                .insert({
                    booking_id: bookingId,
                    buyer_id: session.user.id,
                    host_id: booking.listing.host_id,
                    service_uid: extractedUid,
                    profile_pic_link: inputValue,
                    account_confirmation: 'confirmed' // The status is set to 'confirmed' directly
                });

            if (error) throw error;
            
            setStep('final'); // On success, move to the final message

        } catch (error) {
            console.error(error);
            setError("Failed to save your details. Please check your database permissions and try again.");
            setIsSubmitting(false);
            setStep('form'); 
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    
    const serviceName = booking?.listing?.service?.name || 'the service';

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-center items-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Connect Your Account</h1>
                </div>
            </header>
            <main className="max-w-md mx-auto px-4 py-6">
                {step === 'form' && (
                    <div className="p-6 bg-white dark:bg-white/5 rounded-2xl animate-in fade-in">
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Final Step!</h2>
                        <p className="text-center text-gray-600 dark:text-slate-300 mt-2 mb-6">
                            Please provide your {serviceName} profile URL to connect your account.
                        </p>
                        <form onSubmit={handleProceedToConfirmation} className="space-y-4 text-left">
                            <div>
                                <label htmlFor="verificationInput" className="text-sm font-medium text-gray-500 dark:text-slate-400">
                                    {serviceName} Profile URL
                                </label>
                                <input id="verificationInput" type="url" value={inputValue} onChange={(e) => handleUrlInputChange(e.target.value)} placeholder="http://googleusercontent.com/spotify.com/..." className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={!extractedUid || isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
                                {isSubmitting ? 'Processing...' : 'Verify URL'}
                            </button>
                        </form>
                    </div>
                )}
                {step === 'confirmation' && (
                    <div className="text-center p-6 bg-white dark:bg-white/5 rounded-2xl animate-in fade-in">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Is this your Profile ID?</h2>
                        <div className="my-6 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
                            <p className="text-lg font-mono text-purple-500 dark:text-purple-400 break-all">{extractedUid}</p>
                        </div>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-lg flex items-start gap-2">
                           <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                           <span>Only click "Yes" if you are 100% sure. This ID will be sent to the host to grant you access.</span>
                        </p>
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep('form')} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
                                No, go back
                            </button>
                            <button onClick={handleFinalConfirm} disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : "Yes, that's my ID"}
                            </button>
                        </div>
                    </div>
                )}
                {step === 'final' && (
                    <div className="text-center p-8 bg-white dark:bg-white/5 rounded-2xl animate-in fade-in">
                        <PartyPopper className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Successful!</h2>
                        <p className="text-gray-600 dark:text-slate-300 mt-2">
                           You will receive your invite link very soon from the host.
                        </p>
                        <p className="text-gray-600 dark:text-slate-300 mt-4">
                           Thank you for using our platform. Happy saving!
                        </p>
                        <p className="text-sm text-gray-400 mt-6 animate-pulse">Redirecting you now...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ConnectAccountPage;