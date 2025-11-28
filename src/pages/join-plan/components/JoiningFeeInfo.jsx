import React from 'react';
import { ShieldCheck } from 'lucide-react';

const JoiningFeeInfo = ({ amount }) => {
    return (
        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
            <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        DapBuddy Shield
                    </h4>
                    <span className="text-[10px] uppercase font-bold bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                        One-time: ₹{amount}
                    </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    Activates comprehensive protection for your subscription:
                </p>
                <ul className="mt-2 space-y-1">
                    <li className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-indigo-400"></div> 
                        <span><strong>Escrow Payment Protection</strong> (Funds held securely)</span>
                    </li>
                    <li className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-indigo-400"></div> 
                        <span><strong>Service Continuity Guarantee</strong> (Plan insurance)</span>
                    </li>
                    <li className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-indigo-400"></div> 
                        <span><strong>Verified Community Access</strong> (Identity verification)</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default JoiningFeeInfo;