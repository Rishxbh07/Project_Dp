import React from 'react';
import { PiggyBank, IndianRupee, PieChart } from 'lucide-react';

const SavingsSummary = ({ soloPrice, userPrice }) => {
    const solo = Number(soloPrice) || 0;
    const user = Number(userPrice) || 0;

    // Calculate monthly savings in Rupees
    const monthlySaving = solo > 0 ? solo - user : 0;
    // Calculate savings as a percentage
    const savingsPercentage = solo > 0 ? ((monthlySaving / solo) * 100).toFixed(0) : 0;

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Monthly Savings</h3>
                <PiggyBank className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-around text-center">
                {/* Savings in Rupees */}
                <div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center">
                        <IndianRupee className="w-6 h-6" />
                        {monthlySaving.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">rupees saved</p>
                </div>
                
                <div className="h-12 w-px bg-gray-200 dark:bg-slate-700"></div>

                {/* Savings in Percentage */}
                <div>
                     <p className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center">
                        {savingsPercentage}%
                        <PieChart className="w-6 h-6 ml-1" />
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">less than solo price</p>
                </div>
            </div>
        </section>
    );
};

export default SavingsSummary;