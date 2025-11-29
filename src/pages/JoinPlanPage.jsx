import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { AlertCircle, IndianRupee } from 'lucide-react';

// Components
import PlanHeader from './join-plan/components/PlanHeader';
import PlanStats from './join-plan/components/PlanStats';
import UserConfigForm from './join-plan/components/UserConfigForm';
import PaymentSection from './join-plan/components/PaymentSection';
import { usePlanPricing } from './join-plan/hooks/usePlanPricing';

const JoinPlanPage = () => {
    const { listingId } = useParams();
    const navigate = useNavigate();

    // --- State Management ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listing, setListing] = useState(null);
    const [error, setError] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);
    
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

    // --- Helper: Get Input Config ---
    const getFallbackConfig = (serviceName) => {
        const name = (serviceName || 'Service').toLowerCase();
        
        // 1. Email-based services
        if (name.includes('youtube') || name.includes('google') || name.includes('family link')) {
            return { 
                label: 'Google Email Address', 
                placeholder: 'e.g., yourname@gmail.com',
                type: 'email', 
                validationRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                extractValue: (m) => m[0] 
            };
        }

        // 2. Spotify specific
        if (name.includes('spotify')) {
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
            label: 'Account Email/ID', 
            placeholder: 'Enter your account details', 
            type: 'text', 
            validationRegex: /.+/, 
            extractValue: (m) => m[0] 
        };
    };

    // --- Initialization ---
    useEffect(() => {
        const init = async () => {
            try {
                // 1. Check Session
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate('/auth');
                    return;
                }
                setUser(session.user);

                // 2. Fetch Listing & Wallet
                const [listingRes, walletRes] = await Promise.all([
                    supabase.from('listings')
                        .select(`*, service:services(*), host:profiles(*), bookings(buyer_id)`)
                        .eq('id', listingId)
                        .single(),
                    supabase.from('credit_wallets')
                        .select('credit_balance')
                        .eq('user_id', session.user.id)
                        .single()
                ]);

                if (listingRes.error) throw listingRes.error;
                setListing(listingRes.data);

                // 3. Configure Input Form
                const config = listingRes.data.service?.user_config || {};
                const fallback = getFallbackConfig(listingRes.data.service?.name);
                
                // Merge config, ensuring label exists
                const finalConfig = { ...fallback, ...config };
                if (!finalConfig.label) finalConfig.label = fallback.label;
                setInputConfig(finalConfig);

                // 4. Check if already joined
                if (listingRes.data.bookings?.some(b => b.buyer_id === session.user.id)) {
                    setIsAlreadyJoined(true);
                }

                if (walletRes.data) setWalletBalance(walletRes.data.credit_balance);

            } catch (err) {
                console.error("Init Error:", err);
                setError("Failed to load plan details. It may have been removed.");
            } finally {
                setLoading(false);
            }
        };
        init();

        // Load Razorpay Script
        if (!document.getElementById('razorpay-checkout-js')) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.id = 'razorpay-checkout-js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, [listingId, navigate]);

    // --- MAIN FUNCTION: Handle Join (Booking First Flow) ---
    const handleJoinPlan = async () => {
        if (!listing || !user) return;
        
        // 1. Validate User Input
        if (listing.service?.sharing_method === 'invite_link' && !extractedValue) {
            setInputError(inputConfig?.errorMessage || 'Please check your input.');
            return;
        }

        setIsProcessingPayment(true);
        setError('');

        try {
            // STEP A: CREATE BOOKING (Status: 'not paid')
            // This ensures we have a booking ID to link the transaction to.
            const { data: bookingData, error: bookingError } = await supabase.rpc('create_booking_atomic', {
                p_listing_id: listing.id,
                p_buyer_id: user.id
            });

            if (bookingError) throw bookingError;
            
            // Handle RPC response (can be object or array)
            const newBooking = Array.isArray(bookingData) ? bookingData[0] : bookingData;
            if (!newBooking?.booking_id) throw new Error("Failed to initialize booking.");
            
            const bookingId = newBooking.booking_id;

            // STEP B: SAVE USER CONNECTION DETAILS
            // We save this now so even if payment fails, we know what they wanted to join with.
            if (listing.service?.sharing_method === 'invite_link') {
                const { error: detailsError } = await supabase.from('connected_accounts').insert({
                    booking_id: bookingId,
                    buyer_id: user.id,
                    host_id: listing.host_id,
                    service_id: listing.service.id,
                    service_uid: extractedValue,
                    profile_link: inputConfig.type === 'url' ? inputValue : null,
                    joined_email: inputConfig.type === 'email' ? inputValue : null,
                    account_confirmation: 'confirmed'
                });
                if (detailsError) throw new Error("Failed to save connection details.");
            }

            // STEP C: CREATE ORDER (Pass Booking ID)
            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
                body: { 
                    listing_id: listing.id, 
                    user_id: user.id, 
                    payment_option: paymentOption, 
                    use_coins: useCoins,
                    booking_id: bookingId // <--- CRITICAL: Passing ID here so transaction table is filled
                }
            });

            if (orderError || !orderData?.id) throw new Error("Payment initialization failed.");

            // STEP D: OPEN RAZORPAY
            const options = {
                key: orderData.key, // From Edge Function
                amount: orderData.amount,
                currency: orderData.currency,
                name: "DapBuddy",
                description: `Join ${listing.service.name}`,
                order_id: orderData.is_subscription ? undefined : orderData.id,
                subscription_id: orderData.is_subscription ? orderData.id : undefined,
                prefill: { email: user.email },
                theme: { color: "#7c3aed" },
                modal: { 
                    ondismiss: () => setIsProcessingPayment(false) 
                },
                handler: async (response) => {
                    // STEP E: VERIFY & ACTIVATE
                    await handlePaymentSuccess(response, orderData, bookingId);
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                console.error("Payment Failed:", response.error);
                // Redirect to Payment Result Page with FAILURE status
                navigate('/payment-result', { 
                    state: { 
                        status: 'failed', 
                        planName: listing.service.name 
                    } 
                });
            });
            rzp.open();

        } catch (err) {
            console.error("Process Error:", err);
            // Redirect to Payment Result Page with FAILURE status
            navigate('/payment-result', { 
                state: { 
                    status: 'failed', 
                    planName: listing.service.name 
                } 
            });
        }
    };

    // --- Activation Handler ---
    const handlePaymentSuccess = async (response, orderData, bookingId) => {
        try {
            // 1. Verify Signature
            const verifyBody = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                [orderData.is_subscription ? 'razorpay_subscription_id' : 'razorpay_order_id']: orderData.id
            };
            
            const { error: verifyError } = await supabase.functions.invoke('verify-payment', { body: verifyBody });
            if (verifyError) throw new Error("Payment signature verification failed.");

            // 2. Activate Booking (Populate NULL columns)
            const cycleDays = listing.service?.billing_cycle_days || 30;
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + cycleDays);

            const { error: activateError } = await supabase.from('bookings').update({
                payment_status: 'paid',
                paid_until: validUntil.toISOString(),
                status: 'active',
                current_flow_node_id: 'NEW_USER_ONBOARDING',
                joined_at: new Date().toISOString()
            }).eq('id', bookingId);

            if (activateError) throw new Error("Failed to activate booking.");

            // 3. Mark Transaction as Paid
            await supabase.from('transactions').update({
                payout_status: 'paid'
            }).eq('gateway_transaction_id', orderData.id);

            // 4. Navigate to Payment Result Page (SUCCESS)
            // This page will then show the "Go to Subscription" button
            navigate('/payment-result', { 
                state: { 
                    status: 'success', 
                    transactionId: response.razorpay_payment_id, 
                    amount: priceDetails.total, 
                    planName: listing.service.name,
                    bookingId: bookingId // Pass booking ID so result page can link to subscription
                } 
            });

        } catch (err) {
            console.error("Activation Error:", err);
            // Navigate to failure if activation fails (even if payment succeeded)
            // Ideally this should go to a "Support needed" page, but for now failure page is safer
            navigate('/payment-result', { 
                state: { 
                    status: 'failed', 
                    planName: listing.service.name 
                } 
            });
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (!listing) return <div className="p-10 text-center text-gray-500">Plan not found or unavailable.</div>;

    const { service, host } = listing;
    // Calculate Plan Rating
    const planRating = listing.rating_count > 0 ? (listing.total_rating / listing.rating_count) : 0;
    
    const isPayDisabled = listing.seats_available <= 0 || isAlreadyJoined || (inputConfig && !extractedValue) || isProcessingPayment;

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans pb-32">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-200 dark:border-white/10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/explore" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">← Back</Link>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Review & Pay</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-xl flex gap-2 items-center border border-red-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0"/> 
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* Plan Info */}
                <PlanHeader service={service} host={host} planRating={planRating} />
                <PlanStats listing={listing} />

                {/* User Input Form */}
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

                {/* Payment Selection */}
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

            {/* Sticky Footer */}
            <footer className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-white/10 p-4 pb-safe z-30">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Total Payable</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <IndianRupee className="w-5 h-5" />{priceDetails.total}
                        </p>
                    </div>
                    <button
                        onClick={handleJoinPlan}
                        disabled={isPayDisabled}
                        className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95
                            ${isPayDisabled 
                                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed shadow-none' 
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/25 hover:-translate-y-0.5'
                            }`}
                    >
                        {isProcessingPayment ? 'Processing...' : isAlreadyJoined ? 'Already Joined' : listing.seats_available <= 0 ? 'Plan Full' : 'Pay Securely'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default JoinPlanPage;