import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, MessageSquare, LogOut, Star } from 'lucide-react';
import Modal from '../components/common/Modal'; // We'll use our existing Modal component

const SubscriptionDetailPage = () => {
  const { subscriptionId } = useParams();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // In a real app, you would fetch subscription details using this ID
  const subscriptionDetails = {
    id: subscriptionId,
    serviceName: 'Netflix Premium',
    hostName: 'Rishabh S.',
    rate: '199',
    renewalDate: 'Oct 15, 2025',
    paymentMethod: 'Wallet Balance',
    planRating: 4.8,
    hostRating: 5.0,
    joinedDate: 'July 22, 2025',
  };

  const handleLeavePlan = () => {
    // Here you would add the logic to officially remove the user from the plan
    console.log("User has left the plan.");
    setShowLeaveModal(false);
    // You might want to navigate the user back to the subscription list page after this
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
          <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/subscription" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
              &larr; Back
            </Link>
            <h1 className="text-xl font-bold">{subscriptionDetails.serviceName}</h1>
            <div className="w-16"></div> {/* Spacer */}
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-6">
          {/* Enhanced Plan Details Card */}
          <section className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Hosted by</p>
                <p className="text-gray-900 dark:text-white font-semibold text-lg">{subscriptionDetails.hostName}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 dark:text-slate-400 text-sm">Monthly Rate</p>
                <p className="text-purple-600 dark:text-purple-300 font-bold text-2xl">₹{subscriptionDetails.rate}</p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-white/10"></div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Plan Rating</p>
                <p className="text-gray-900 dark:text-white font-semibold flex items-center gap-1">{subscriptionDetails.planRating} <Star className="w-4 h-4 text-yellow-400" fill="currentColor" /></p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 dark:text-slate-400 text-sm">Host Rating</p>
                <p className="text-gray-900 dark:text-white font-semibold flex items-center gap-1 justify-end">{subscriptionDetails.hostRating} <Star className="w-4 h-4 text-yellow-400" fill="currentColor" /></p>
              </div>
            </div>
             <div className="border-t border-gray-200 dark:border-white/10"></div>
             <div className="flex justify-between items-center">
               <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Next Renewal</p>
                <p className="text-gray-900 dark:text-white font-semibold">{subscriptionDetails.renewalDate}</p>
              </div>
               <div className="text-right">
                <p className="text-gray-500 dark:text-slate-400 text-sm">Joined on</p>
                <p className="text-gray-900 dark:text-white font-semibold">{subscriptionDetails.joinedDate}</p>
              </div>
            </div>
          </section>

          {/* Management Options */}
          <section className="space-y-3">
            <button className="w-full text-left bg-white dark:bg-white/5 flex items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-transparent">
              <MessageSquare className="w-5 h-5 mr-4 text-blue-500 dark:text-blue-400" />
              <span className="font-semibold text-gray-800 dark:text-white">Chat with Host</span>
            </button>
            <button className="w-full text-left bg-white dark:bg-white/5 flex items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-transparent">
              <AlertTriangle className="w-5 h-5 mr-4 text-yellow-500 dark:text-yellow-400" />
              <span className="font-semibold text-gray-800 dark:text-white">Raise an Issue</span>
            </button>
            <button 
              onClick={() => setShowLeaveModal(true)}
              className="w-full text-left bg-red-500/10 flex items-center p-4 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-4 text-red-500 dark:text-red-400" />
              <span className="font-semibold text-red-500 dark:text-red-400">Leave Plan</span>
            </button>
          </section>
        </div>
      </div>

      {/* --- Leave Plan Confirmation Modal --- */}
      <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h3>
          
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
            If you leave this plan, your spot will be given to someone else and you will **not receive a refund** for the current billing period.
          </p>
          
          <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3 text-sm mb-6">
            <p className="font-semibold text-purple-600 dark:text-purple-300">Rethink Your Life's Stupid Decisions Period</p>
            <p className="text-purple-500 dark:text-purple-400 text-xs mt-1">
              You will have a **48-hour** grace period to rejoin this plan without penalty if your spot has not been filled.
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setShowLeaveModal(false)}
              className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleLeavePlan}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Continue Anyways
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SubscriptionDetailPage;