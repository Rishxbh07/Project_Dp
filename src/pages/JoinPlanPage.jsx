import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { IndianRupee, AlertCircle } from 'lucide-react';

// New Components
import PlanHeader from './join-plan/components/PlanHeader';
import PlanStats from './join-plan/components/PlanStats';
import UserConfigForm from './join-plan/components/UserConfigForm';
import PaymentSection from './join-plan/components/PaymentSection';
import { usePlanPricing } from './join-plan/hooks/usePlanPricing';

// --- FALLBACK CONFIG GENERATOR ---
const getFallbackConfig = (serviceName) => {
    const name = serviceName || 'Service';
    const lowerName = name.toLowerCase();

    if (lowerName.includes('youtube') || lowerName.includes('google') || lowerName.includes('family link')) {
        return { 
            label: `${name} Email Address`, 
            placeholder: 'e.g., yourname@gmail.com',
            type: 'email', 
            validationRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
            extractValue: (m) => m[0] 
        };
    }

    if (lowerName.includes('spotify')) {
        return { 
            label: 'Spotify Profile URL', 
            placeholder: 'e.g., http://googleusercontent.com/spotify.com/user/xyz...', 
            type: 'url', 
            validationRegex: /spotify\.com/, 
            extractValue: (m) => m[0] 
        };
    }

    return { 
        label: `${name} Profile URL`, 
        placeholder: `Paste your ${name} profile link here`,
        type: 'text', 
        validationRegex: /.+/, 
        extractValue: (m) => m[0] 
    };
};

const JoinPlanPage = ({ session: propSession }) => {
    // FIXED: Accept 'id' (standard) OR 'listingId' to prevent mismatch bugs
    const params = useParams();
    const listingId = params.id || params.listingId;
    
    const navigate = useNavigate();

    // Data State
    const [session, setSession] = useState(propSession);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    // Form & Payment State
    const [useCoins, setUseCoins] = useState(false);
    const [paymentOption, setPaymentOption] = useState('autoPay');
    const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [extractedValue, setExtractedValue] = useState(null);
    const [inputConfig, setInputConfig] = useState(null);
    const [inputError, setInputError] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Pricing Hook
    const priceDetails = usePlanPricing(listing, paymentOption, useCoins, walletBalance);

    // 1. Initialize & Fetch Data
    useEffect(() => {
        const initPage = async () => {
            setLoading(true);
            try {
                // A. Ensure Session Exists (Fix for infinite load if prop is missing)
                let currentSession = propSession;
                if (!currentSession) {
                    const { data } = await supabase.auth.getSession();
                    currentSession = data.session;
                    if (!currentSession) {
                        // Redirect to login if absolutely no session found
                        navigate('/auth'); 
                        return;
                    }
                    setSession(currentSession);
                }

                // B. Validate ID
                if (!listingId) {
                    throw new Error("Invalid Plan ID. Please return to the marketplace.");
                }

                // C. Fetch Data
                const [listingRes, walletRes] = await Promise.all([
                    supabase.from('listings').select(`*, service:services(*), host:profiles(*), bookings(buyer_id)`).eq('id', listingId).single(),
                    supabase.from('credit_wallets').select('credit_balance').eq('user_id', currentSession.user.id).single()
                ]);

                if (listingRes.error) throw listingRes.error;
                
                const data = listingRes.data;
                setListing(data);

                // D. Configure Form based on Service
                if (data?.service?.name && data.service.sharing_method === 'invite_link') {
                    const fallback = getFallbackConfig(data.service.name);
                    const dbConfig = data.service.user_config || {};
                    const finalConfig = { ...fallback, ...dbConfig };
                    if (!finalConfig.label) finalConfig.label = fallback.label;
                    setInputConfig(finalConfig);
                }

                // E. Check if already joined
                if (data.bookings) {
                    setIsAlreadyJoined(data.bookings.some(b => b.buyer_id === currentSession.user.id));
                }
                
                if (walletRes.data) setWalletBalance(walletRes.data.credit_balance);

            } catch (err) {
                console.error("Page Load Error:", err);
                setError(err.message || 'Could not load plan details.');
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [listingId, propSession, navigate]);

    // 2. Load Razorpay SDK
    useEffect(() => {
        const scriptId = 'razorpay-checkout-js';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.id = scriptId;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // 3. Handle Payment
    const handleJoinPlan = async () => {
        if (!session || !listing) return;
        
        if (listing.service?.sharing_method === 'invite_link' && !extractedValue) {
            setInputError(inputConfig?.errorMessage || 'Please check your input.');
            return;
        }

        setIsProcessingPayment(true);
        setError('');

        try {
            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
                body: { 
                    listing_id: listing.id,
                    user_id: session.user.id,
                    payment_option: paymentOption,
                    use_coins: useCoins
                }
            });

            if (orderError) throw orderError;
            if (!orderData || !orderData.id) throw new Error("Payment initialization failed.");

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: orderData.amount, 
                currency: orderData.currency,
                name: "DapBuddy",
                description: `Join ${listing.service?.name || 'Plan'}`,
                order_id: orderData.id,
                prefill: { email: session.user.email },
                theme: { color: "#8b5cf6" },
                modal: { 
                    ondismiss: () => setIsProcessingPayment(false)
                },
                handler: async function (response) {
                    try {
                        const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
                            body: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            }
                        });
                        
                        if (verifyError) throw new Error("Verification failed.");
                        await finalizeBooking(response.razorpay_payment_id);
                        
                    } catch (innerError) {
                        navigate('/payment-result', { 
                            state: { status: 'failed', planName: listing.service?.name || 'Plan' } 
                        });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                navigate('/payment-result', { state: { status: 'failed', planName: listing.service?.name || 'Plan' } });
            });
            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            setError(`Error: ${error.message}`);
            setIsProcessingPayment(false);
        }
    };

    const finalizeBooking = async (gatewayTxId) => {
        try {
            const { data: bookingData, error: bookingError } = await supabase.rpc('create_booking_atomic', {
                p_listing_id: listing.id,
                p_buyer_id: session.user.id
            });
            
            if (bookingError || !bookingData?.[0]?.success) throw new Error('Booking failed.');
            const newBookingId = bookingData[0].booking_id;
            
            const originalAmount = parseFloat(priceDetails.total) + parseFloat(priceDetails.coinDiscount);

            const { error: transactionError } = await supabase.from('transactions').insert({
                booking_id: newBookingId,
                buyer_id: session.user.id,
                original_amount: originalAmount.toFixed(2),
                credits_used: priceDetails.coinDiscount,
                final_amount_charged: priceDetails.total,
                payout_to_host: (priceDetails.total - priceDetails.platformFee).toFixed(2),
                platform_fee: priceDetails.platformFee,
                billing_options: paymentOption,
                gateway_transaction_id: gatewayTxId,
                payout_status: 'paid'
            });

            if (transactionError) throw transactionError;

            if (listing.service?.sharing_method === 'invite_link') {
                await supabase.from('connected_accounts').insert({
                    booking_id: newBookingId,
                    buyer_id: session.user.id,
                    host_id: listing.host_id,
                    service_id: listing.service.id,
                    service_uid: extractedValue,
                    profile_link: inputConfig.type === 'url' ? inputValue : null,
                    joined_email: inputConfig.type === 'email' ? inputValue : null,
                    account_confirmation: 'confirmed'
                });
            }
            
            navigate('/payment-result', { 
                state: { status: 'success', transactionId: gatewayTxId, amount: priceDetails.total, planName: listing.service?.name || 'Plan' } 
            });

        } catch (err) {
            navigate('/payment-result', { state: { status: 'failed', planName: listing.service?.name || 'Plan' } });
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    
    // Safety check for Service Mismatch
    if (!listing || !listing.service) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50 dark:bg-slate-900">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plan Unavailable</h2>
                <p className="text-gray-600 dark:text-slate-400 mt-2 max-w-md">{error || 'This plan could not be found.'}</p>
                <button onClick={() => navigate('/explore')} className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700">Back to Explore</button>
            </div>
        );
    }
    
    const { service, host, seats_available, host_id, total_rating, rating_count } = listing;
    const isHost = session.user.id === host_id;
    const planRating = rating_count > 0 ? (total_rating / rating_count) : 0;
    const isPayButtonDisabled = seats_available <= 0 || loading || isHost || isAlreadyJoined || (inputConfig && !extractedValue) || isProcessingPayment;

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/marketplace/${service.name.toLowerCase()}`} className="text-purple-500 hover:text-purple-600 transition-colors text-sm font-medium">← Back</Link>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Review & Pay</h1>
                    <div className="w-12"></div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 pb-48">
                <PlanHeader service={service} host={host} planRating={planRating} />
                <PlanStats listing={listing} />
                
                {inputConfig && (
                    <UserConfigForm 
                        config={inputConfig} 
                        value={inputValue} 
                        onChange={setInputValue} 
                        error={inputError} 
                        setError={setInputError}
                        setExtractedValue={setExtractedValue}
                    />
                )}

                <PaymentSection 
                    paymentOption={paymentOption}
                    setPaymentOption={setPaymentOption}
                    useCoins={useCoins}
                    setUseCoins={setUseCoins}
                    walletBalance={walletBalance}
                    priceDetails={priceDetails}
                    isBreakdownVisible={isBreakdownVisible}
                    setIsBreakdownVisible={setIsBreakdownVisible}
                />
            </main>
            
            <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 pb-safe">
                <div className="max-w-3xl mx-auto p-4 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Total Payable</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <IndianRupee className="w-6 h-6" />{priceDetails.total}
                        </p>
                    </div>
                    <button
                        onClick={handleJoinPlan}
                        disabled={isPayButtonDisabled}
                        className={`flex-1 max-w-sm py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${isPayButtonDisabled ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5'}`}
                    >
                        {isProcessingPayment ? 'Processing...' : isHost ? "Your Plan" : isAlreadyJoined ? "Joined" : seats_available <= 0 ? 'Full' : 'Pay Securely'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default JoinPlanPage;