import React from 'react';
import { IndianRupee, TrendingUp } from 'lucide-react';

const EarningsSummary = ({ basePrice, memberCount, platformFee }) => {
    // Ensure all values are numbers before calculating to prevent NaN
    const price = Number(basePrice) || 0;
    const members = Number(memberCount) || 0;
    const fee = Number(platformFee) || 0;

    const grossEarnings = price * members;
    const netEarnings = grossEarnings - (grossEarnings * (fee / 100));

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Earnings</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-center">
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center">
                    <IndianRupee className="w-8 h-8" />
                    {netEarnings.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">this month (after fees)</p>
            </div>
             <p className="text-xs text-center text-gray-400 dark:text-slate-500 mt-3">
                ({price} x {members} members) - {fee}% fee
            </p>
        </section>
    );
};

export default EarningsSummary;