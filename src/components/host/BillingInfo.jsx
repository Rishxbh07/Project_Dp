import React from 'react';
import { Calendar, Wallet } from 'lucide-react';

const BillingInfo = ({ transaction }) => {
    const billingChoice = transaction?.billing_options || 'N/A';
    const nextRenewal = transaction ? new Date(transaction.expires_on).toLocaleDateString() : 'N/A';
    
    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
             <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Billing Information</h3>
             <div className="space-y-3">
                 <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <Wallet className="w-6 h-6 text-purple-500"/>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Billing Choice</p>
                        <p className="font-semibold text-gray-800 dark:text-slate-200 capitalize">{billingChoice}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-500"/>
                     <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Next Renewal</p>
                        <p className="font-semibold text-gray-800 dark:text-slate-200">{nextRenewal}</p>
                    </div>
                 </div>
             </div>
        </div>
    );
};

export default BillingInfo;