import React from 'react';
import { IndianRupee, Calendar, CheckCircle } from 'lucide-react';

// Helper to format dates consistently
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const PlanPricing = ({ price, joinedAt, expiresOn }) => {
    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
            {/* Monthly Price Display */}
            <div className="text-center mb-6">
                <p className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
                    <IndianRupee className="w-8 h-8" />
                    {price}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">per month</p>
            </div>

            {/* Two-Point Stepper Timeline */}
            <div className="flex items-center justify-between">
                {/* Step 1: Joined On */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Joined On</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{formatDate(joinedAt)}</p>
                </div>

                {/* Connecting Line */}
                <div className="flex-grow h-px bg-gray-200 dark:bg-slate-700 mx-4"></div>

                {/* Step 2: Paid Until */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mb-2">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Paid Until</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{formatDate(expiresOn)}</p>
                </div>
            </div>
        </section>
    );
};

export default PlanPricing;