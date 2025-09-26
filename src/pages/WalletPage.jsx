import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Coins, Gift, LogIn, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const WalletPage = ({ session }) => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
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
        const { data: walletData, error: walletError } = await supabase
          .from('credit_wallets')
          .select('credit_balance')
          .eq('user_id', session.user.id)
          .single();

        if (walletError) throw walletError;
        setBalance(walletData?.credit_balance || 0);

        const { data: ledgerData, error: ledgerError } = await supabase
          .from('credit_ledger')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (ledgerError) throw ledgerError;
        setTransactions(ledgerData || []);

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
      <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen flex flex-col items-center justify-center text-center px-4">
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
    // --- MODIFIED: Consistent background styling ---
    <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-center items-center">
          <h1 className="text-xl font-bold">My Wallet</h1>
        </div>
      </header>
      <div className="max-w-md mx-auto px-4 py-6">
        {/* --- MODIFIED: Updated balance card style --- */}
        <section className="relative bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:30px_30px] opacity-50"></div>
          <div className="relative z-10 text-center">
            <p className="text-purple-200 text-sm font-medium">Available Promo Coins</p>
            <h2 className="text-5xl font-bold text-white mt-2 mb-4">{loading ? '...' : `🪙 ${balance}`}</h2>
            <p className="text-purple-300 text-xs">Use them to get discounts!</p>
          </div>
        </section>

        {/* --- MODIFIED: Action Buttons with consistent styling --- */}
        <section className="grid grid-cols-2 gap-4 text-center mb-8">
          <button className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
            <Coins className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mb-2" />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">Buy Coins</span>
          </button>
          <button className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
            <Gift className="w-8 h-8 text-pink-500 dark:text-pink-400 mb-2" />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">My Referral Earning</span>
          </button>
        </section>

        <section>
          <h3 className="text-2xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {loading && <p>Loading transactions...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && transactions.length === 0 && (
              <p className="text-center text-gray-500 dark:text-slate-400">No transactions yet.</p>
            )}
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit' || tx.amount > 0;
              return (
                // --- MODIFIED: Transaction item styling ---
                <div key={tx.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isCredit ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {isCredit ? <ArrowDownLeft className="w-5 h-5 text-green-500" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">{tx.notes || tx.type}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-bold text-lg ${isCredit ? 'text-green-500 dark:text-green-400' : 'text-gray-700 dark:text-slate-300'}`}>
                    {isCredit ? `+${tx.amount}` : `-${tx.amount}`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="h-24"></div>
      </div>
    </div>
  );
};

export default WalletPage;