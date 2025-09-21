import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SubscriptionCard from '../components/SubscriptionCard'; // Import the new card

const SubscriptionPage = ({ session }) => {
  const [activeTab, setActiveTab] = useState('mySubscriptions');

  // Dummy data for now
    const mySubscriptions = [
        { id: 1, serviceName: 'Netflix Premium', hostName: 'Rishabh S.', rate: '199', renewalDate: 'Oct 15, 2025', slotsFilled: 4, slotsTotal: 4 },
        { id: 2, serviceName: 'Spotify Duo', hostName: 'Aisha K.', rate: '75', renewalDate: 'Oct 1, 2025', slotsFilled: 2, slotsTotal: 2 },
    ];
  const hostedPlans = []; // Empty for now to show the "Host a Plan" button

  return (
    <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 text-center">
          <h1 className="text-xl font-bold">Your Plans</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Aesthetic Toggle Switch */}
        <div className="relative flex p-1 bg-gray-200 dark:bg-slate-800/80 backdrop-blur-md rounded-full mb-8">
          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-transform duration-300 ease-in-out ${
              activeTab === 'hostedPlans' ? 'transform translate-x-full' : ''
            }`}
          ></div>
          <button
            onClick={() => setActiveTab('mySubscriptions')}
            className="relative w-1/2 py-2 text-sm font-semibold z-10 text-gray-800 dark:text-white"
          >
            My Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('hostedPlans')}
            className="relative w-1/2 py-2 text-sm font-semibold z-10 text-gray-800 dark:text-white"
          >
            Hosted Plans
          </button>
        </div>

        {/* Conditional Content */}
        <div className="px-4">
          {activeTab === 'mySubscriptions' && (
            <div className="space-y-4 animate-in fade-in">
              {mySubscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
            </div>
          )}

          {activeTab === 'hostedPlans' && (
            <div className="animate-in fade-in">
              {hostedPlans.length > 0 ? (
                <div className="space-y-4">
                  {/* Map over hosted plans here if they exist */}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/20">
                  <p className="text-gray-500 dark:text-slate-400 mb-4">No plans Hosted yet</p>
                  <Link to="/host-plan">
                    <button className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-purple-700 transition-all">
                      Host a Plan
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
       {/* Extra spacing for bottom navigation */}
       <div className="h-24"></div>
    </div>
  );
};

export default SubscriptionPage;