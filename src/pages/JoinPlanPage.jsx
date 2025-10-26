import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { Star, ShieldCheck, Users, IndianRupee, ChevronDown, ChevronUp, Crown, Flame, Zap, Baby, Sparkles, CheckCircle2 } from 'lucide-react';

// --- HELPER FUNCTION (Moved from ConnectAccount.jsx) ---
const getServiceInputConfig = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('spotify')) {
        return {
            label: 'Your Spotify Profile URL',
            placeholder: 'e.g., https://open.spotify.com/user/...',
            type: 'url',
            validationRegex: /^(https?:\/\/)?(open\.)?spotify\.com\/user\/([a-zA-Z0-9]+)/,
            extractValue: (match) => match[3], // Extracts the user ID
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
            extractValue: (match) => match[0], // Extracts the full email
            errorMessage: 'Please enter a valid email address.',
            optionalLabel: 'YouTube Channel Name (optional)'
        };
    }
    // Default case for other services
    return {
        label: 'Service Identifier (Profile Link/Email)',
        placeholder: 'Enter the required link or email',
        type: 'text',
        validationRegex: /.+/, // Just checks that it's not empty
        extractValue: (match) => match[0],
        errorMessage: 'This field cannot be empty.',
        optionalLabel: 'Profile Name (optional)'
    };
};


const getAgeDetails = (creationDate) => {
    if (!creationDate) return null;
    
    const now = new Date();
    const startDate = new Date(creationDate);
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return { text: 'Newborn', icon: Baby, color: 'text-cyan-400' };
    if (diffDays <= 30) return { text: 'Recent', icon: Sparkles, color: 'text-green-400' };
    if (diffDays <= 90) return { text: 'Established', icon: Zap, color: 'text-yellow-400' };
    if (diffDays <= 180) return { text: 'Veteran', icon: Star, color: 'text-orange-400' };
    if (diffDays <= 365) return { text: 'Legend', icon: Flame, color: 'text-red-500' };
    return { text: 'Legendary', icon: Crown, color: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(252,211,77,0.7)]' };
};


const JoinPlanPage = ({ session }) => {
    const { listingId } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

    const [walletBalance, setWalletBalance] = useState(0);
    const [useCoins, setUseCoins] = useState(false);
    const [paymentOption, setPaymentOption] = useState('autoPay');
    const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
    const [priceDetails, setPriceDetails] = useState({
        base: 0, platformFee: 0, convenienceFee: 0, tax: 0, coinDiscount: 0, total: 0
    });
    
    // --- NEW: State for the integrated Connect Account form ---
    const [inputValue, setInputValue] = useState('');
    const [optionalName, setOptionalName] = useState('');
    const [extractedValue, setExtractedValue] = useState(null);
    const [inputConfig, setInputConfig] = useState(null);
    const [inputError, setInputError] = useState('');

    useEffect(() => {
        const fetchAllDetails = async () => {
            if (!listingId || !session?.user?.id) {
                setError("Missing user session or listing ID.");
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
                const listingData = listingRes.data;
                setListing(listingData);

                // --- NEW: Set up the form config when listing data arrives ---
                if (listingData?.service?.name && listingData.service.sharing_method === 'invite_link') {
                    const config = getServiceInputConfig(listingData.service.name);
                    setInputConfig(config);
                }

                const alreadyJoined = listingData.bookings.some(b => b.buyer_id === session.user.id);
                setIsAlreadyJoined(alreadyJoined);
                if (walletRes.data) setWalletBalance(walletRes.data.credit_balance);
            } catch (error) {
                setError('Could not find the requested plan.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllDetails();
    }, [listingId, session]);

    useEffect(() => {
        if (!listing || !listing.service) return;
        const base = Number(listing.service.base_price);
        const commissionRate = Number(listing.service.platform_commission_rate) / 100;
        const platformFee = base * commissionRate;
        let convenienceFee = 0;
        let taxRate = 0.12;
        if (paymentOption === 'oneTime') {
            convenienceFee = base * 0.10;
            taxRate = 0.18;
        }
        const subtotal = base + platformFee + convenienceFee;
        const tax = subtotal * taxRate;
        const maxCoinsToUse = 10;
        const coinDiscount = useCoins && walletBalance >= maxCoinsToUse ? maxCoinsToUse : 0;
        const total = subtotal + tax - coinDiscount;
        setPriceDetails({
            base: base.toFixed(2), platformFee: platformFee.toFixed(2), convenienceFee: convenienceFee.toFixed(2), tax: tax.toFixed(2), coinDiscount: coinDiscount.toFixed(2), total: total.toFixed(2)
        });
    }, [listing, paymentOption, useCoins, walletBalance]);

    // --- NEW: Input handler and validator ---
    const handleInputChange = (value) => {
        setInputValue(value);
        setInputError('');
        if (inputConfig?.validationRegex) {
            const match = value.match(inputConfig.validationRegex);
            if (match) {
                setExtractedValue(inputConfig.extractValue(match));
            } else {
                setExtractedValue(null);
            }
        }
    };


    const handleJoinPlan = async () => {
        if (!session || !listing) return;

        // --- NEW: Final validation before proceeding ---
        if (listing.service.sharing_method === 'invite_link' && !extractedValue) {
            setInputError(inputConfig.errorMessage);
            return;
        }

        setLoading(true);
        setError('');

        // --- ADDED LOGS ---
        console.log('Attempting RPC call with listingId:', listing.id);
        console.log('Session User ID:', session.user.id);
        
        try { // <-- START: The only try block
            // Step 1: Create the booking
            const { data: bookingData, error: bookingError } = await supabase.rpc('create_booking_atomic', {
                p_listing_id: listing.id,
                p_buyer_id: session.user.id
            });
            if (bookingError) throw bookingError;
            if (!bookingData || !bookingData[0].success) throw new Error(bookingData[0].message || 'Failed to create booking.');
            
            const newBookingId = bookingData[0].booking_id;

            // Step 2: Create the transaction
            const originalAmount = parseFloat(priceDetails.total) + parseFloat(priceDetails.coinDiscount);
            const { error: transactionError } = await supabase.from('transactions').insert({
                booking_id: newBookingId,
                buyer_id: session.user.id,
                original_amount: originalAmount.toFixed(2),
                credits_used: priceDetails.coinDiscount,
                final_amount_charged: priceDetails.total,
                payout_to_host: (priceDetails.total - priceDetails.platformFee).toFixed(2),
                platform_fee: priceDetails.platformFee,
                billing_options: paymentOption
            });
            if (transactionError) throw transactionError;

            // Step 3: Create the connected account record (if required)
            if (listing.service.sharing_method === 'invite_link') {
                const { error: connectError } = await supabase.from('connected_accounts').insert({
                    booking_id: newBookingId,
                    buyer_id: session.user.id,
                    host_id: listing.host_id,
                    service_id: listing.service.id,
                    service_uid: inputConfig.extractValue(inputValue.match(inputConfig.validationRegex)),
                    profile_link: inputConfig.type === 'url' ? inputValue : null,
                    joined_email: inputConfig.type === 'email' ? inputValue : null,
                    service_profile_name: optionalName,
                    account_confirmation: 'confirmed'
                });
                if (connectError) throw connectError;
            }
            
            // Step 4: Navigate to subscriptions page
            navigate('/subscription');

        } catch (error) { // <-- START: The only catch block
            console.error('Full error object in catch:', error); // This will show the full error in your console
            setError(`An error occurred: ${error.message}`);
        } finally { // <-- START: The only finally block
            setLoading(false);
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error || !listing) return <p className="text-center text-red-500 mt-8">{error || 'Plan details could not be loaded.'}</p>;
    
    const { service, host, average_rating = 0, created_at, seats_total, seats_available, host_id } = listing;
    const hostRating = host?.host_rating ?? 0;
    const isHost = session.user.id === host_id;
    const slotsFilled = seats_total - seats_available;
    const ageDetails = getAgeDetails(created_at);
    const AgeIcon = ageDetails?.icon;

    // --- NEW: Updated disabled logic for the pay button ---
    const isPayButtonDisabled = seats_available <= 0 || loading || isHost || isAlreadyJoined || (inputConfig && !extractedValue);
    
    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/marketplace/${service?.name?.toLowerCase() ?? 'explore'}`} className="text-purple-500 dark:text-purple-400 text-sm">
                        ← Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Join Plan</h1>
                    <div className="w-16"></div>
                </div>
            </header>
            <main className="max-w-md mx-auto px-4 py-6 pb-48">
                <section className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg shadow-gray-200/50 dark:shadow-black/20 mb-6">
                    <div className="text-center mb-6">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl blur-md opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center text-white font-bold text-5xl shadow-lg w-full h-full">
                                {service?.name?.charAt(0) ?? '?'}
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{service?.name ?? 'Service'}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Hosted by <span className="font-semibold text-purple-500 dark:text-purple-300">{host?.username ?? 'a member'}</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-slate-400">Host Rating</p>
                            <p className="font-bold text-lg text-yellow-500 flex items-center justify-center gap-1">
                                <Star className="w-4 h-4" /> {hostRating.toFixed(1)}
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-slate-400">Plan Rating</p>
                            <p className="font-bold text-lg text-blue-500 flex items-center justify-center gap-1">
                                <Star className="w-4 h-4" /> {average_rating.toFixed(1)}
                            </p>
                        </div>
                    </div>
                </section>
                
                <section className="bg-white dark:bg-slate-800/50 p-4 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg shadow-gray-200/50 dark:shadow-black/20 mb-6 divide-y divide-gray-100 dark:divide-white/10">
                    <div className="flex items-center gap-4 p-3">
                        <div className="w-10 h-10 flex-shrink-0 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center"><Users className="w-6 h-6 text-purple-500 dark:text-purple-400" /></div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{slotsFilled} of {seats_total} Slots Filled</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{seats_available} spot(s) remaining</p>
                        </div>
                    </div>
                     {ageDetails && AgeIcon && (
                        <div className="flex items-center gap-4 p-3">
                            <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${ageDetails.glow || ''}`}><AgeIcon className={`w-6 h-6 ${ageDetails.color}`} /></div>
                            <div>
                                <p className={`font-semibold ${ageDetails.color}`}>{ageDetails.text} Plan</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Active for {Math.floor(Math.ceil(Math.abs(new Date() - new Date(created_at)) / (1000 * 60 * 60 * 24)) / 30)} months</p>
                            </div>
                        </div>
                     )}
                    <div className="flex items-center gap-4 p-3">
                        <div className="w-10 h-10 flex-shrink-0 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-green-500" /></div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">DapBuddy Guarantee</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Full refund if you don't get access.</p>
                        </div>
                    </div>
                </section>
                
                {/* --- NEW: Conditionally render the Connect Account form --- */}
                {inputConfig && (
                    <section className="mb-6">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Connect Your Account</h3>
                        <div className="p-4 bg-white dark:bg-white/5 rounded-2xl space-y-4">
                            <div>
                                <label htmlFor="inputValue" className="text-sm font-medium text-gray-500 dark:text-slate-400">
                                    {inputConfig.label} *
                                </label>
                                <input
                                    id="inputValue"
                                    type={inputConfig.type}
                                    value={inputValue}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder={inputConfig.placeholder}
                                    className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="optionalName" className="text-sm font-medium text-gray-500 dark:text-slate-400">
                                    {inputConfig.optionalLabel}
                                </label>
                                <input
                                    id="optionalName"
                                    type="text"
                                    value={optionalName}
                                    onChange={(e) => setOptionalName(e.target.value)}
                                    placeholder="Your display name on the service"
                                    className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            {inputError && <p className="text-red-500 text-sm text-center">{inputError}</p>}
                        </div>
                    </section>
                )}
                
                <section className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Payment Option</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setPaymentOption('autoPay')} className={`relative p-4 rounded-xl text-left border-2 transition-all duration-300 ${paymentOption === 'autoPay' ? 'border-purple-500 bg-purple-500/10 shadow-lg' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                            {paymentOption === 'autoPay' && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-purple-500" />}
                            <p className="font-semibold text-gray-900 dark:text-white">Auto Pay</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Best value, renews automatically.</p>
                        </button>
                        <button onClick={() => setPaymentOption('oneTime')} className={`relative p-4 rounded-xl text-left border-2 transition-all duration-300 ${paymentOption === 'oneTime' ? 'border-purple-500 bg-purple-500/10 shadow-lg' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                            {paymentOption === 'oneTime' && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-purple-500" />}
                            <p className="font-semibold text-gray-900 dark:text-white">One-time</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Pay for one month only.</p>
                        </button>
                    </div>
                </section>
                
                <section className="mb-6 space-y-3">
                    <div className="flex items-center bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                        <input type="checkbox" id="useCoins" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} disabled={walletBalance < 10} className="h-5 w-5 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50" />
                        <label htmlFor="useCoins" className="ml-3 flex-1 text-sm font-medium text-gray-800 dark:text-slate-200">
                            Use Promo Coins <span className="text-xs text-gray-500">(Balance: {walletBalance})</span>
                        </label>
                        <span className="font-semibold text-green-500">-₹10.00</span>
                    </div>
                    <div onClick={() => setIsBreakdownVisible(!isBreakdownVisible)} className="flex justify-between items-center cursor-pointer bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                        <p className="font-semibold text-gray-800 dark:text-white">Price Breakdown</p>
                        {isBreakdownVisible ? <ChevronUp className="text-gray-500"/> : <ChevronDown className="text-gray-500"/>}
                    </div>
                    {isBreakdownVisible && (
                        <div className="bg-gray-100 dark:bg-slate-800/50 p-4 rounded-xl text-sm space-y-2 animate-in fade-in">
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Base Price</span><span>₹{priceDetails.base}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Platform Fee</span><span>+ ₹{priceDetails.platformFee}</span></div>
                            {paymentOption === 'oneTime' && <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Convenience Fee (10%)</span><span>+ ₹{priceDetails.convenienceFee}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">GST ({paymentOption === 'oneTime' ? '18%' : '12%'})</span><span>+ ₹{priceDetails.tax}</span></div>
                            {useCoins && <div className="flex justify-between text-green-600 dark:text-green-400"><span className="">Coin Discount</span><span>- ₹{priceDetails.coinDiscount}</span></div>}
                            <div className="flex justify-between font-bold border-t border-gray-300 dark:border-white/20 pt-2 mt-2"><span>Total Payable</span><span>₹{priceDetails.total}</span></div>
                        </div>
                    )}
                </section>
            </main>
            
            <footer className="fixed bottom-24 left-0 right-0 z-10">
                <div className="max-w-md mx-auto p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 rounded-t-3xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">You Pay</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                <IndianRupee className="w-6 h-6" />{priceDetails.total}
                            </p>
                        </div>
                        <button
                            onClick={handleJoinPlan}
                            disabled={isPayButtonDisabled}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                        >
                            {loading ? 'Processing...' : isHost ? "This is Your Plan" : isAlreadyJoined ? "Already Joined" : (seats_available > 0 ? 'Proceed to Pay' : 'Plan Full')}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default JoinPlanPage;