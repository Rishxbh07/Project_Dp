import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Banknote } from 'lucide-react';

const WalletPage = ({ session }) => {
  // Dummy data for now
  const balance = "1,250.75";
  const transactions = [
    { id: 1, type: 'Subscription', description: 'Netflix Premium', amount: '-₹499', date: 'Sep 18, 2025' },
    { id: 2, type: 'Top-up', description: 'Added funds', amount: '+₹1000', date: 'Sep 15, 2025' },
    { id: 3, type: 'Subscription', description: 'Spotify Duo', amount: '-₹149', date: 'Sep 12, 2025' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900/10 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-center items-center">
            <h1 className="text-xl font-bold">My Wallet</h1>
        </div>
      </header>
      <div className="max-w-md mx-auto px-4 py-6">
        
        {/* Balance Card */}
        <section className="relative bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:30px_30px] opacity-50"></div>
          <div className="relative z-10 text-center">
            <p className="text-purple-200 text-sm font-medium">Available Balance</p>
            <h2 className="text-5xl font-bold text-white mt-2 mb-4">₹{balance}</h2>
            <p className="text-purple-300 text-xs">Last updated today</p>
          </div>
        </section>

        {/* --- MODIFIED: Action Buttons --- */}
        <section className="grid grid-cols-2 gap-4 text-center mb-8">
          <button className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <PlusCircle className="w-8 h-8 text-green-500 dark:text-green-400 mb-2" />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">Add Money</span>
          </button>
          <button className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <Banknote className="w-8 h-8 text-red-500 dark:text-red-400 mb-2" />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">Withdraw</span>
          </button>
        </section>

        {/* Transaction History */}
        <section>
          <h3 className="text-2xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{tx.description}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{tx.date}</p>
                </div>
                <p className={`font-bold text-lg ${tx.amount.startsWith('+') ? 'text-green-500 dark:text-green-400' : 'text-gray-700 dark:text-slate-300'}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Extra spacing for bottom navigation */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};

export default WalletPage;