import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { IndianRupee } from 'lucide-react';

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

    // 1. Email-based services
    if (lowerName.includes('youtube') || lowerName.includes('google') || lowerName.includes('family link')) {
        return { 
            label: `${name} Email Address`, 
            placeholder: 'e.g., yourname@gmail.com',
            type: 'email', 
            validationRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
            extractValue: (m) => m[0] 
        };
    }

    // 2. Spotify specific
    if (lowerName.includes('spotify')) {
        return { 
            label: 'Spotify Profile URL', 
            placeholder: 'e.g., http://googleusercontent.com/spotify.com/user/xyz...', 
            type: 'url', 
            validationRegex: /spotify\.com/, 
            extractValue: (m) => m[0] 
        };
    }

    // 3. Dynamic Default
    return { 
        label: `${name} Profile URL`, 
        placeholder: `Paste your ${name} profile link here`,
        type: 'text', 
        validationRegex: /.+/, 
        extractValue: (m) => m[0] 
    };
};

const JoinPlanPage = ({ session }) => {
    const { listingId } = useParams();
    const navigate = useNavigate();

    // Data State
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

    // 1. Load Razorpay SDK
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

    // 2. Fetch Data
    useEffect(() => {
        const fetchAllDetails = async () => {
            if (!listingId || !session?.user?.id) {
                setError("Missing info to load plan.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [listingRes, walletRes] = await Promise.all([
                    supabase.from('listings').select(`*, service:services(*), host:profiles(*), bookings(buyer_id)`).eq('id', listingId).single(),
                    supabase.from('credit_wallets').select('credit_balance').eq('user_id', session.user.id).single()
                ]);

                if (listingRes.error) throw listingRes.error;
                const data = listingRes.data;
                setListing(data);

                // Config Merging Logic
                if (data?.service?.name && data.service.sharing_method === 'invite_link') {
                    const fallback = getFallbackConfig(data.service.name);
                    const dbConfig = data.service.user_config || {};
                    const finalConfig = { ...fallback, ...dbConfig };
                    
                    // Ensure label is never empty
                    if (!finalConfig.label) finalConfig.label = fallback.label;
                    
                    setInputConfig(finalConfig);
                }

                setIsAlreadyJoined(data.bookings.some(b => b.buyer_id === session.user.id));
                if (walletRes.data) setWalletBalance(walletRes.data.credit_balance);
            } catch (error) {
                console.error(error);
                setError('Could not find the requested plan.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllDetails();
    }, [listingId, session]);

    // 3. Handle Payment (SECURE FLOW)
    const handleJoinPlan = async () => {
        if (!session || !listing) return;
        
        // Client-side Input Validation
        if (listing.service.sharing_method === 'invite_link' && !extractedValue) {
            setInputError(inputConfig?.errorMessage || 'Please check your input.');
            return;
        }

        setIsProcessingPayment(true);
        setError('');

        try {
            // A. Create Order (SECURE: Send Intent, NOT Amount)
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

            // B. Razorpay Flow
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount, // Trust the server's amount
                currency: orderData.currency,
                name: "DapBuddy",
                description: `Join ${listing.service.name}`,
                order_id: orderData.id,
                prefill: { email: session.user.email },
                theme: { color: "#8b5cf6" },
                modal: { 
                    ondismiss: () => {
                        setIsProcessingPayment(false);
                        // Optionally handle manual close by user here if needed
                    }
                },
                handler: async function (response) {
                    try {
                        // C. Verify Signature
                        const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
                            body: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            }
                        });
                        
                        if (verifyError) throw new Error("Verification failed.");
                        
                        // D. Commit to Database
                        await finalizeBooking(response.razorpay_payment_id);
                        
                    } catch (innerError) {
                        // Navigate to failure page instead of just showing alert
                        navigate('/payment-result', { 
                            state: { 
                                status: 'failed', 
                                planName: listing.service.name
                            } 
                        });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                // Navigate to failure page on Razorpay failure event
                navigate('/payment-result', { 
                    state: { 
                        status: 'failed',
                        planName: listing.service.name 
                    } 
                });
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
            // 1. Create Booking Record
            const { data: bookingData, error: bookingError } = await supabase.rpc('create_booking_atomic', {
                p_listing_id: listing.id,
                p_buyer_id: session.user.id
            });
            
            if (bookingError || !bookingData?.[0]?.success) throw new Error('Booking failed.');
            
            const newBookingId = bookingData[0].booking_id;
            
            // 2. Record Transaction
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

            // 3. Save Account Connection Details
            if (listing.service.sharing_method === 'invite_link') {
                const { error: connectError } = await supabase.from('connected_accounts').insert({
                    booking_id: newBookingId,
                    buyer_id: session.user.id,
                    host_id: listing.host_id,
                    service_id: listing.service.id,
                    service_uid: extractedValue,
                    profile_link: inputConfig.type === 'url' ? inputValue : null,
                    joined_email: inputConfig.type === 'email' ? inputValue : null,
                    account_confirmation: 'confirmed'
                });
                if (connectError) throw connectError;
            }
            
            // SUCCESS REDIRECT -> To Payment Result Page
            navigate('/payment-result', { 
                state: { 
                    status: 'success', 
                    transactionId: gatewayTxId, 
                    amount: priceDetails.total,
                    planName: listing.service.name
                } 
            });

        } catch (err) {
            console.error("Finalize Error:", err);
            // Even if finalize fails after payment, send to failure page (or dedicated support page)
            navigate('/payment-result', { 
                state: { 
                    status: 'failed', 
                    planName: listing.service.name 
                } 
            });
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error || !listing) return <p className="text-center text-red-500 mt-8">{error || 'Plan not found.'}</p>;
    
    // --- DERIVED DATA ---
    const { service, host, seats_total, seats_available, host_id, total_rating, rating_count } = listing;
    const isHost = session.user.id === host_id;
    
    // Correct Plan Rating Calculation: Total / Count
    const planRating = rating_count > 0 ? (total_rating / rating_count) : 0;
    
    const isPayButtonDisabled = seats_available <= 0 || loading || isHost || isAlreadyJoined || (inputConfig && !extractedValue) || isProcessingPayment;

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/marketplace/${service?.name?.toLowerCase() ?? 'explore'}`} className="text-purple-500 hover:text-purple-600 transition-colors text-sm font-medium">← Back</Link>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Review & Pay</h1>
                    <div className="w-12"></div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 pb-48">
                {/* Passed the calculated planRating here */}
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