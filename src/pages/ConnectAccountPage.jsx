import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { UserCheck, AlertTriangle, PartyPopper } from 'lucide-react';

// --- MODIFIED: Added 'optionalLabel' for the new input field ---
const getServiceInputConfig = (serviceName) => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('spotify')) {
        return {
            label: 'Spotify Profile URL',
            placeholder: 'https://open.spotify.com/user/your-user-id',
            type: 'url',
            validationRegex: /^(https?:\/\/)?(open\.)?spotify\.com\/user\/([a-zA-Z0-9]+)/,
            extractValue: (match) => match[3],
            errorMessage: 'Please enter a valid Spotify user profile URL.',
            optionalLabel: 'Spotify Username (optional)' // New optional field
        };
    }
    
    if (name.includes('youtube')) {
        return {
            label: 'Google Account Email for YouTube',
            placeholder: 'youremail@gmail.com',
            type: 'email',
            validationRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            extractValue: (match) => match[0],
            errorMessage: 'Please enter a valid email address.',
            optionalLabel: 'YouTube Channel Name (optional)' // New optional field
        };
    }

    return {
        label: 'Service Identifier',
        placeholder: 'Enter the required link, email, or ID',
        type: 'text',
        validationRegex: /.+/, 
        extractValue: (match) => match[0],
        errorMessage: 'This field cannot be empty.'
    };
};

const ConnectAccountPage = ({ session }) => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState('form');
    const [inputValue, setInputValue] = useState('');
    const [optionalName, setOptionalName] = useState(''); // --- NEW: State for the optional input ---
    const [extractedValue, setExtractedValue] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputConfig, setInputConfig] = useState(null);

    useEffect(() => {
        const fetchBookingInfo = async () => {
            if (!bookingId) {
                setError("Booking ID is missing.");
                setLoading(false);
                return;
            }
            const { data, error } = await supabase
                .from('bookings')
                .select(`*, listing:listings(host_id, service:services(id, name))`)
                .eq('id', bookingId)
                .single();

            if (error) {
                setError("Could not fetch booking details.");
            } else {
                setBooking(data);
                const config = getServiceInputConfig(data.listing.service.name);
                setInputConfig(config);
            }
            setLoading(false);
        };
        fetchBookingInfo();
    }, [bookingId]);
    
    useEffect(() => {
        if (step === 'final') {
            const timer = setTimeout(() => navigate('/subscription'), 4000);
            return () => clearTimeout(timer);
        }
    }, [step, navigate]);

    const handleInputChange = (value) => {
        setInputValue(value);
        setError('');
        if (inputConfig?.validationRegex) {
            const match = value.match(inputConfig.validationRegex);
            setExtractedValue(match ? inputConfig.extractValue(match) : null);
        }
    };
    
    const handleProceedToConfirmation = (e) => {
        e.preventDefault();
        if (!extractedValue) {
            setError(inputConfig.errorMessage);
            return;
        }
        setStep('confirmation');
    };

    const handleFinalConfirm = async () => {
        if (!extractedValue || !booking || !session) {
            setError("Something went wrong. Missing required information.");
            return;
        }
        setIsSubmitting(true);
        setError('');

        let dataToInsert = {
            booking_id: bookingId,
            buyer_id: session.user.id,
            host_id: booking.listing.host_id,
            service_id: booking.listing.service.id,
            account_confirmation: 'confirmed' 
        };

        const serviceName = booking.listing.service.name.toLowerCase();

        // --- MODIFIED: Logic to handle the new optional field ---
        if (serviceName.includes('spotify')) {
            dataToInsert.service_uid = extractedValue;
            dataToInsert.profile_link = inputValue;
            if (optionalName) dataToInsert.service_profile_name = optionalName; // Save optional username
        } else if (serviceName.includes('youtube')) {
            dataToInsert.joined_email = extractedValue;
            if (optionalName) dataToInsert.service_profile_name = optionalName; // Save optional channel name
        } else {
            dataToInsert.profile_link = inputValue;
        }

        try {
            const { error } = await supabase
                .from('connected_accounts')
                .insert(dataToInsert);

            if (error) throw error;
            setStep('final');

        } catch (error) {
            console.error(error);
            setError("Failed to save your details. Please try again.");
            setIsSubmitting(false);
            setStep('form');
        }
    };
    
    if (loading || !inputConfig) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    
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
                           To get access, please provide your {serviceName} details.
                        </p>
                        <form onSubmit={handleProceedToConfirmation} className="space-y-4 text-left">
                            {/* Required Input */}
                            <div>
                                <label htmlFor="verificationInput" className="text-sm font-medium text-gray-500 dark:text-slate-400">
                                    {inputConfig.label}
                                </label>
                                <input id="verificationInput" type={inputConfig.type} value={inputValue} onChange={(e) => handleInputChange(e.target.value)} placeholder={inputConfig.placeholder} className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                            </div>

                            {/* --- NEW: Optional Input Field --- */}
                            {inputConfig.optionalLabel && (
                                <div>
                                    <label htmlFor="optionalInput" className="text-sm font-medium text-gray-500 dark:text-slate-400">
                                        {inputConfig.optionalLabel}
                                    </label>
                                    <input id="optionalInput" type="text" value={optionalName} onChange={(e) => setOptionalName(e.target.value)} placeholder={inputConfig.optionalLabel} className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={!extractedValue || isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
                                {isSubmitting ? 'Processing...' : 'Verify & Proceed'}
                            </button>
                        </form>
                    </div>
                )}
                {step === 'confirmation' && (
                     <div className="text-center p-6 bg-white dark:bg-white/5 rounded-2xl animate-in fade-in">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Is this correct?</h2>
                        <div className="my-6 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg space-y-2">
                           <div>
                             <p className="text-xs text-gray-500 dark:text-slate-400">{inputConfig.label}</p>
                             <p className="text-lg font-mono text-purple-500 dark:text-purple-400 break-all">{extractedValue}</p>
                           </div>
                           {optionalName && (
                             <div>
                               <p className="text-xs text-gray-500 dark:text-slate-400">{inputConfig.optionalLabel}</p>
                               <p className="text-lg font-mono text-purple-500 dark:text-purple-400 break-all">{optionalName}</p>
                             </div>
                           )}
                        </div>
                         <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-lg flex items-start gap-2">
                           <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                           <span>This information will be sent to the host to grant you access. Ensure it is 100% accurate.</span>
                        </p>
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep('form')} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
                                No, go back
                            </button>
                            <button onClick={handleFinalConfirm} disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : "Yes, that's correct"}
                            </button>
                        </div>
                    </div>
                )}
                 {step === 'final' && (
                    <div className="text-center p-8 bg-white dark:bg-white/5 rounded-2xl animate-in fade-in">
                        <PartyPopper className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Linked!</h2>
                        <p className="text-gray-600 dark:text-slate-300 mt-2">
                           The host has been notified. You will receive access shortly.
                        </p>
                         <p className="text-sm text-gray-400 mt-6 animate-pulse">Redirecting you to your subscriptions...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ConnectAccountPage;