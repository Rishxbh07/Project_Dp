import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { Star, ShieldCheck, Clock, Users, IndianRupee, ChevronDown, ChevronUp, Coins } from 'lucide-react';

const JoinPlanPage = ({ session }) => {
    const { listingId } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

    // State for payment, pricing, and wallet
    const [walletBalance, setWalletBalance] = useState(0);
    const [useCoins, setUseCoins] = useState(false);
    const [paymentOption, setPaymentOption] = useState('autoPay');
    const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
    const [priceDetails, setPriceDetails] = useState({
        base: 0,
        platformFee: 0,
        convenienceFee: 0,
        tax: 0,
        coinDiscount: 0,
        total: 0
    });

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
                    supabase
                        .from('listings')
                        .select(`
                            id, seats_total, average_rating, created_at,
                            host_id,
                            service:services (name, base_price, platform_commission_rate),
                            host:profiles (username, host_rating),
                            bookings (buyer_id)
                        `)
                        .eq('id', listingId)
                        .single(),
                    supabase
                        .from('credit_wallets')
                        .select('credit_balance')
                        .eq('user_id', session.user.id)
                        .single()
                ]);

                if (listingRes.error) throw listingRes.error;
                const listingData = listingRes.data;
                setListing(listingData);

                const alreadyJoined = listingData.bookings.some(b => b.buyer_id === session.user.id);
                setIsAlreadyJoined(alreadyJoined);

                if (walletRes.data) {
                    setWalletBalance(walletRes.data.credit_balance);
                }

            } catch (error) {
                setError('Could not find the requested plan.');
                console.error('Error fetching plan details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDetails();
    }, [listingId, session]);

    // Effect to calculate price breakdown
    useEffect(() => {
        if (!listing) return;

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
            base: base.toFixed(2),
            platformFee: platformFee.toFixed(2),
            convenienceFee: convenienceFee.toFixed(2),
            tax: tax.toFixed(2),
            coinDiscount: coinDiscount.toFixed(2),
            total: total.toFixed(2)
        });

    }, [listing, paymentOption, useCoins, walletBalance]);

    const handleFakePayment = async () => {
        if (!session || !listing) return;
        setLoading(true);
        
        try {
            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    listing_id: listing.id,
                    buyer_id: session.user.id,
                    payment_status: 'Paid'
                })
                .select()
                .single();

            if (bookingError) throw bookingError;

            // --- THIS IS THE FIX ---
            const originalAmount = parseFloat(priceDetails.total) + parseFloat(priceDetails.coinDiscount);
            const { error: transactionError } = await supabase
                .from('transactions')
                .insert({
                    booking_id: bookingData.id,
                    buyer_id: session.user.id,
                    original_amount: originalAmount.toFixed(2), // Add original amount
                    credits_used: priceDetails.coinDiscount, // Add credits used
                    final_amount_charged: priceDetails.total,
                    payout_to_host: (priceDetails.total - priceDetails.platformFee).toFixed(2),
                    platform_fee: priceDetails.platformFee
                });

            if (transactionError) throw transactionError;

            navigate('/subscription');

        } catch (error) {
            setError(`An error occurred: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error || !listing) return <p className="text-center text-red-500 mt-8">{error || 'Plan details could not be loaded.'}</p>;

    const { service, host, bookings, average_rating, created_at, seats_total, host_id } = listing;
    const isHost = session.user.id === host_id;
    const slotsFilled = bookings.length;
    const sharableSlots = Math.max(0, seats_total - 1);
    const slotsAvailable = sharableSlots - slotsFilled;
    const renewalDate = new Date(created_at);
    renewalDate.setDate(renewalDate.getDate() + 30);

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/marketplace/${service.name.toLowerCase()}`} className="text-purple-500 dark:text-purple-400 text-sm">
                        &larr; Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Join Plan</h1>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 pb-48">
                <section className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 mb-6">
                    <div className="text-center mb-4">
                        <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                            {service.name.charAt(0)}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{service.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Hosted by {host.username}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-slate-400">Host Rating</p>
                            <p className="font-bold text-lg text-yellow-500 flex items-center justify-center gap-1">
                                <Star className="w-4 h-4" /> {host.host_rating.toFixed(1)}
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

                <section className="bg-white dark:bg-white/5 p-4 rounded-3xl border border-gray-200 dark:border-white/10 mb-6 space-y-4">
                     <div className="flex items-center gap-4 p-2">
                        <Users className="w-6 h-6 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{slotsFilled} of {sharableSlots} Slots Filled</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{slotsAvailable} spot(s) remaining</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-2">
                        <Clock className="w-6 h-6 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Renews on {renewalDate.toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Billed monthly from your join date</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-2">
                        <ShieldCheck className="w-6 h-6 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">DapBuddy Guarantee</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Full refund if you don't get access.</p>
                        </div>
                    </div>
                </section>
                
                <section className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Payment Option</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setPaymentOption('autoPay')} className={`p-4 rounded-xl text-left border-2 transition-all ${paymentOption === 'autoPay' ? 'border-purple-500 bg-purple-500/10' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                            <p className="font-semibold text-gray-900 dark:text-white">Auto Pay</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Best value, renews automatically.</p>
                        </button>
                        <button onClick={() => setPaymentOption('oneTime')} className={`p-4 rounded-xl text-left border-2 transition-all ${paymentOption === 'oneTime' ? 'border-purple-500 bg-purple-500/10' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                            <p className="font-semibold text-gray-900 dark:text-white">One-time</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Pay for one month only.</p>
                        </button>
                    </div>
                </section>
                
                <section className="mb-6 space-y-3">
                    <div className="flex items-center bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                        <input
                            type="checkbox"
                            id="useCoins"
                            checked={useCoins}
                            onChange={(e) => setUseCoins(e.target.checked)}
                            disabled={walletBalance < 10}
                            className="h-5 w-5 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                        />
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
            
            <footer className="fixed bottom-24 left-0 right-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto p-4 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">You Pay</p>
                         <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                           <IndianRupee className="w-5 h-5" />{priceDetails.total}
                        </p>
                    </div>
                    <button 
                        onClick={handleFakePayment}
                        disabled={slotsAvailable <= 0 || loading || isHost || isAlreadyJoined}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {loading 
                            ? 'Processing...' 
                            : isHost 
                                ? "This is Your Plan" 
                                : isAlreadyJoined
                                    ? "Already Joined"
                                    : (slotsAvailable > 0 ? 'Proceed to Pay' : 'Plan Full')
                        }
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default JoinPlanPage;