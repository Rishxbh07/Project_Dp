import React, { useState } from 'react';
import Modal from '../common/Modal';
import { IndianRupee, Ban, UserCog, ShieldAlert } from 'lucide-react';

const GuestRules = ({ isOpen, onAccept, onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleAccept = () => {
        if (dontShowAgain) {
            localStorage.setItem('hideGuestRules', 'true');
        }
        onAccept();
    };

    if (!isOpen) return null;

    const rules = [
        {
            icon: IndianRupee,
            text: "Ensure timely payments for each billing cycle to maintain your spot.",
            color: "text-green-500"
        },
        {
            icon: Ban,
            text: "Do not share the account credentials with anyone outside of this platform.",
            color: "text-red-500"
        },
        {
            icon: UserCog,
            text: "Do not change any account settings, profile information, or passwords.",
            color: "text-purple-500"
        },
        {
            icon: ShieldAlert,
            text: "Report any issues with account access through the DapBuddy dispute system, not directly with the host.",
            color: "text-yellow-500"
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Guest Rules</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">Please agree to the following rules before joining a plan.</p>
                
                <div className="space-y-4 text-left mb-8">
                    {rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg">
                            <rule.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${rule.color}`} />
                            <span className="text-sm text-gray-800 dark:text-slate-200">{rule.text}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center mb-6">
                    <input
                        type="checkbox"
                        id="dont-show-guest"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="dont-show-guest" className="ml-2 text-sm text-gray-700 dark:text-slate-300">I understand, don't show this again.</label>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleAccept} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
                        Agree & Join
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GuestRules;