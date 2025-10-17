import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Coins, Gift, LogIn, ShoppingCart, Award } from 'lucide-react';
import Loader from '../components/common/Loader';

// Transaction Row Component
const TransactionRow = ({ activity }) => {
    const { date, description, amount, isCredit, type } = activity;
    const isDebit = type === 'payment' || !isCredit;

    const getIcon = () => {
        if (type === 'payment') {
            return (
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 bg-red-50 dark:bg-red-500/10">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
            );
        }
        if (isCredit) {
            return (
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 bg-green-50 dark:bg-green-500/10">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
            );
        }
        return (
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 bg-yellow-50 dark:bg-yellow-500/10">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center hover:shadow-md dark:hover:bg-slate-800/80 transition-all duration-200">
            {getIcon()}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white capitalize truncate">{description}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{new Date(date).toLocaleDateString()}</p>
            </div>
            <p className={`font-bold text-base sm:text-lg whitespace-nowrap ml-2 ${isDebit ? 'text-red-500' : 'text-green-500 dark:text-green-400'}`}>
                {isDebit ? `-${amount}` : `+${amount}`}
            </p>
        </div>
    );
};

const WalletPage = ({ session }) => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [allActivity, setAllActivity] = useState([]);
    const [visibleActivityCount, setVisibleActivityCount] = useState(7);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!session) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                const [walletRes, ledgerRes, transactionsRes] = await Promise.all([
                    supabase.from('credit_wallets').select('credit_balance').eq('user_id', session.user.id).single(),
                    supabase.from('credit_ledger').select('*').eq('user_id', session.user.id),
                    supabase.from('transactions').select(`*, booking:bookings(listing:listings(service:services(name)))`).eq('buyer_id', session.user.id)
                ]);

                if (walletRes.error) throw walletRes.error;
                setBalance(walletRes.data?.credit_balance || 0);

                if (ledgerRes.error) throw ledgerRes.error;
                if (transactionsRes.error) throw transactionsRes.error;
                
                const formattedLedger = (ledgerRes.data || []).map(tx => ({
                    id: `credit-${tx.id}`,
                    date: tx.created_at,
                    description: tx.notes || tx.type,
                    amount: tx.amount,
                    isCredit: tx.type === 'credit' || tx.amount > 0,
                    type: 'credit'
                }));

                const formattedTransactions = (transactionsRes.data || []).map(tx => ({
                     id: `payment-${tx.id}`,
                     date: tx.created_at,
                     description: `Payment for ${tx.booking?.listing?.service?.name || 'Plan'}`,
                     amount: tx.final_amount_charged,
                     isCredit: false,
                     type: 'payment'
                }));

                const combined = [...formattedLedger, ...formattedTransactions];
                combined.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAllActivity(combined);

            } catch (error) {
                setError(error.message);
                console.error("Error fetching wallet data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    if (!session) {
        return (
          <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 min-h-screen flex flex-col items-center justify-center text-center px-4">
            <LogIn className="w-16 h-16 text-purple-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Your Wallet</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">To see your balance and transactions, please log in.</p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
            >
              Log In
            </button>
          </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 min-h-screen font-sans text-gray-900 dark:text-white">
            {/* Header */}
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-slate-700/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center">
                    <h1 className="text-xl sm:text-2xl font-bold">My Wallet</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                    
                    {/* Left Column - Wallet Card & Action Buttons */}
                    <div className="lg:col-span-2">
                        {/* Combined Background Container */}
                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700/50 p-6 sm:p-8 space-y-6">
                            
                            {/* Balance Card */}
                            <section className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-purple-500/30 overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:24px_24px] opacity-60"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl"></div>
                                
                                <div className="relative z-10 text-center">
                                    <p className="text-purple-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Available Promo Coins</p>
                                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-3 mb-3 drop-shadow-lg">
                                        {loading ? '...' : `🪙 ${balance}`}
                                    </h2>
                                    <p className="text-purple-200 text-xs sm:text-sm">Use them to get amazing discounts!</p>
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <section className="grid grid-cols-3 gap-3 sm:gap-4">
                                <button className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-200 dark:border-yellow-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                                    <Coins className="w-7 h-7 sm:w-9 sm:h-9 text-yellow-600 dark:text-yellow-400 mb-2 group-hover:rotate-12 transition-transform" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">Buy Coins</span>
                                </button>
                                <button className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-2 border-pink-200 dark:border-pink-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                                    <Gift className="w-7 h-7 sm:w-9 sm:h-9 text-pink-600 dark:text-pink-400 mb-2 group-hover:rotate-12 transition-transform" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white text-center leading-tight">Referrals</span>
                                </button>
                                <button className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                                    <Award className="w-7 h-7 sm:w-9 sm:h-9 text-green-600 dark:text-green-400 mb-2 group-hover:rotate-12 transition-transform" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">Rewards</span>
                                </button>
                            </section>
                        </div>
                    </div>

                    {/* Right Column - Transaction History */}
                    <div className="lg:col-span-3 mt-6 lg:mt-0">
                        <section className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700/50 p-6 sm:p-8 min-h-[500px] flex flex-col">
                            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">Transaction History</h3>
                            
                            <div className="flex-1 flex flex-col">
                                {loading && <Loader />}
                                
                                {error && (
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-red-500">{error}</p>
                                    </div>
                                )}
                                
                                {!loading && allActivity.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12">
                                        <img 
                                            src="/assets/icons/notransactions.png" 
                                            alt="No transactions" 
                                            className="w-48 h-48 sm:w-64 sm:h-64 opacity-80 mb-4"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div style={{display: 'none'}} className="flex flex-col items-center">
                                            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                                                <ShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400 dark:text-purple-500" />
                                            </div>
                                            <p className="text-center text-gray-500 dark:text-slate-400 text-base sm:text-lg font-medium">No transactions yet</p>
                                            <p className="text-center text-gray-400 dark:text-slate-500 text-xs sm:text-sm mt-2">Your transaction history will appear here</p>
                                        </div>
                                    </div>
                                )}
                                
                                {!loading && allActivity.length > 0 && (
                                    <>
                                        <div className="space-y-3 sm:space-y-4 flex-1">
                                            {allActivity.slice(0, visibleActivityCount).map((activity) => (
                                                <TransactionRow key={activity.id} activity={activity} />
                                            ))}
                                        </div>
                                        
                                        {allActivity.length > visibleActivityCount && (
                                            <div className="mt-6 text-center">
                                                <button
                                                    onClick={() => setVisibleActivityCount(allActivity.length)}
                                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                                                >
                                                    Load More
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            
            <div className="h-24"></div>
        </div>
    );
};

export default WalletPage;