import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ShieldCheck, Users, IndianRupee, ChevronDown, ChevronUp, Crown, CheckCircle2, Zap, LifeBuoy } from 'lucide-react';

// This helper function remains the same
const getServiceInputConfig = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('spotify')) {
        return {
            label: 'Your Spotify Profile URL',
            placeholder: 'e.g., open.spotify.com/user/...',
            type: 'url',
            validationRegex: /^(https?:\/\/)?(open\.)?spotify\.com\/user\/([a-zA-Z0-9]+)/,
            extractValue: (match) => match[3],
            errorMessage: 'Please enter a valid Spotify user profile URL.',
            optionalLabel: 'Spotify Username (optional)'
        };
    }
    if (name.includes('youtube')) {
        return {
            label: 'Your Google Account Email for YouTube',
            placeholder: 'youremail@gmail.com',
            type: 'email',
            validationRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            extractValue: (match) => match[0],
            errorMessage: 'Please enter a valid email address.',
            optionalLabel: 'YouTube Channel Name (optional)'
        };
    }
    return {
        label: 'Service Identifier (Profile Link/Email)',
        placeholder: 'Enter the required link or email',
        type: 'text',
        validationRegex: /.+/,
        extractValue: (match) => match[0],
        errorMessage: 'This field cannot be empty.',
        optionalLabel: 'Profile Name (optional)'
    };
};


const JoinDapBuddyPlanPage = ({ session }) => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [useCoins, setUseCoins] = useState(false);
    const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
    const [priceDetails, setPriceDetails] = useState({ base: 0, tax: 0, coinDiscount: 0, total: 0 });
    const [inputValue, setInputValue] = useState('');
    const [optionalName, setOptionalName] = useState('');
    const [extractedValue, setExtractedValue] = useState(null);
    const [inputConfig, setInputConfig] = useState(null);
    const [inputError, setInputError] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const benefits = [
        { icon: Zap, title: 'Fast Access*', description: 'Account details are typically delivered within a few hours.' },
        { icon: ShieldCheck, title: 'Service Guarantee', description: 'We guarantee the service is active for the full month.' },
        { icon: LifeBuoy, title: '24/7 Support', description: 'Our support team is always here to help with any issues.' },
    ];

    useEffect(() => {
        const fetchAllDetails = async () => {
            if (!planId || !session?.user?.id) {
                setError("Missing user session or plan ID.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [planRes, walletRes] = await Promise.all([
                    supabase.from('dapbuddy_plans').select(`*, service:services(*)`).eq('id', planId).single(),
                    supabase.from('credit_wallets').select('credit_balance').eq('user_id', session.user.id).single(),
                ]);

                if (planRes.error) throw planRes.error;
                const planData = planRes.data;
                setPlan(planData);

                if (planData?.service?.name) {
                    const config = getServiceInputConfig(planData.service.name);
                    setInputConfig(config);
                }
                
                if (walletRes.data) setWalletBalance(walletRes.data.credit_balance);
            } catch (error) {
                setError('Could not find the requested DapBuddy plan.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllDetails();
    }, [planId, session]);

    useEffect(() => {
        if (!plan) return;
        const base = Number(plan.platform_price);
        const taxRate = 0.12;
        const tax = base * taxRate;
        const maxCoinsToUse = 10;
        const coinDiscount = useCoins && walletBalance >= maxCoinsToUse ? maxCoinsToUse : 0;
        const total = base + tax - coinDiscount;
        setPriceDetails({ base: base.toFixed(2), tax: tax.toFixed(2), coinDiscount: coinDiscount.toFixed(2), total: total.toFixed(2) });
    }, [plan, useCoins, walletBalance]);

    const handleInputChange = (value) => {
        setInputValue(value);
        setInputError('');
        if (inputConfig?.validationRegex) {
            const match = value.match(inputConfig.validationRegex);
            setExtractedValue(match ? inputConfig.extractValue(match) : null);
        }
    };

    // *** THIS IS THE UPDATED FUNCTION ***
    const handleFakePayment = async () => {
        if (isPayButtonDisabled || (inputConfig && !extractedValue)) {
            if (inputConfig && !extractedValue) setInputError(inputConfig.errorMessage);
            return;
        }
    
        setIsProcessingPayment(true);
        setError('');
    
        // Simulate a network delay
        setTimeout(async () => {
            try {
                // Step 1: Create a fake transaction record. This is still needed to link to the booking.
                const { data: transactionData, error: transactionError } = await supabase.from('transactions').insert({
                    buyer_id: session.user.id,
                    original_amount: (parseFloat(priceDetails.total) + parseFloat(priceDetails.coinDiscount)).toFixed(2),
                    credits_used: priceDetails.coinDiscount,
                    final_amount_charged: priceDetails.total,
                    platform_fee: 0,
                    payout_to_host: 0,
                    billing_options: 'autoPay', 
                    gateway_transaction_id: `fake_${new Date().getTime()}`
                }).select().single();
                if (transactionError) throw transactionError;
    
                // Step 2: Create the DapBuddy Booking. This is the only record that triggers the backend logic.
                const { error: bookingError } = await supabase.from('dapbuddy_bookings').insert({
                    user_id: session.user.id,
                    plan_id: plan.id,
                    service_id: plan.service.id,
                    transaction_id: transactionData.id,
                    status: 'active'
                });
                if (bookingError) throw bookingError;
    
                // THE BACKEND TRIGGER TAKES OVER FROM HERE!
    
                // Step 3: Redirect to the subscriptions page on success
                navigate('/subscription');
    
            } catch (error) {
                setError(`An error occurred: ${error.message}`);
            } finally {
                setIsProcessingPayment(false);
            }
        }, 2000); // 2-second delay
    };
    
    // ... (rest of the component JSX is unchanged)
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error || !plan) return <p className="text-center text-red-500 mt-8">{error || 'Plan details could not be loaded.'}</p>;
    
    const { service } = plan;
    const isPayButtonDisabled = loading || isAlreadyJoined || isProcessingPayment;
    
    const getButtonText = () => {
        if (isProcessingPayment) return 'Processing...';
        if (loading) return 'Loading...';
        if (isAlreadyJoined) return 'Already Joined';
        if (inputConfig && !extractedValue) return 'Enter Account Details';
        return 'Proceed to Pay';
    };

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/marketplace/${service?.name?.toLowerCase() ?? 'explore'}`} className="text-purple-500 dark:text-purple-400 text-sm">← Back</Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Join DapBuddy Plan</h1>
                    <div className="w-16"></div>
                </div>
            </header>
            <main className="max-w-md mx-auto px-4 py-6 pb-48">
                <section className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg shadow-gray-200/50 dark:shadow-black/20 mb-6">
                    <div className="text-center mb-6">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl blur-md opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center text-white font-bold text-5xl shadow-lg w-full h-full">{service?.name?.charAt(0) ?? '?'}</div>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{service?.name ?? 'Service'}</h2>
                        <p className="font-semibold text-purple-500 dark:text-purple-400">Official DapBuddy Plan</p>
                    </div>
                </section>

                 <section className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Plan Benefits</h3>
                    <div className="space-y-3">
                        {benefits.map(item => (
                            <div key={item.title} className="flex items-start gap-4 p-3 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-white/10">
                                <div className="w-10 h-10 flex-shrink-0 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <item.icon className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{item.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {inputConfig && (
                    <section className="mb-6">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Connect Your Account</h3>
                        <div className="p-4 bg-white dark:bg-white/5 rounded-2xl space-y-4 border border-gray-200 dark:border-white/10">
                            <div>
                                <label htmlFor="inputValue" className="text-sm font-medium text-gray-500 dark:text-slate-400">{inputConfig.label} *</label>
                                <input id="inputValue" type={inputConfig.type} value={inputValue} onChange={(e) => handleInputChange(e.target.value)} placeholder={inputConfig.placeholder} className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                            </div>
                            <div>
                                <label htmlFor="optionalName" className="text-sm font-medium text-gray-500 dark:text-slate-400">{inputConfig.optionalLabel}</label>
                                <input id="optionalName" type="text" value={optionalName} onChange={(e) => setOptionalName(e.target.value)} placeholder="Your display name on the service" className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            {inputError && <p className="text-red-500 text-sm text-center">{inputError}</p>}
                        </div>
                    </section>
                )}

                <section className="mb-6 space-y-3">
                     <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Payment Summary</h3>
                    <div className="flex items-center bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                        <input type="checkbox" id="useCoins" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} disabled={walletBalance < 10} className="h-5 w-5 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50" />
                        <label htmlFor="useCoins" className="ml-3 flex-1 text-sm font-medium text-gray-800 dark:text-slate-200">Use Promo Coins <span className="text-xs text-gray-500">(Balance: {walletBalance})</span></label>
                        <span className="font-semibold text-green-500">-₹10.00</span>
                    </div>
                    <div onClick={() => setIsBreakdownVisible(!isBreakdownVisible)} className="flex justify-between items-center cursor-pointer bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                        <p className="font-semibold text-gray-800 dark:text-white">Price Breakdown</p>
                        {isBreakdownVisible ? <ChevronUp className="text-gray-500"/> : <ChevronDown className="text-gray-500"/>}
                    </div>
                    {isBreakdownVisible && (
                        <div className="bg-gray-100 dark:bg-slate-800/50 p-4 rounded-xl text-sm space-y-2 animate-in fade-in">
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Base Price</span><span>₹{priceDetails.base}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">GST (12%)</span><span>+ ₹{priceDetails.tax}</span></div>
                            {useCoins && <div className="flex justify-between text-green-600 dark:text-green-400"><span className="">Coin Discount</span><span>- ₹{priceDetails.coinDiscount}</span></div>}
                            <div className="flex justify-between font-bold border-t border-gray-300 dark:border-white/20 pt-2 mt-2"><span>Total Payable</span><span>₹{priceDetails.total}</span></div>
                        </div>
                    )}
                </section>
            </main>
            
            <footer className="fixed bottom-24 left-0 right-0 z-30">
                <div className="max-w-md mx-auto p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">You Pay Monthly</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center"><IndianRupee className="w-6 h-6" />{priceDetails.total}</p>
                        </div>
                        <button
                            onClick={handleFakePayment}
                            disabled={isPayButtonDisabled || (inputConfig && !extractedValue)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                        >
                            {getButtonText()}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default JoinDapBuddyPlanPage;