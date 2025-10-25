// src/components/common/RevealWarningModal.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal.jsx';
import { ShieldAlert } from 'lucide-react';

const RevealWarningModal = ({ isOpen, onClose, onAccept }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleAccept = () => {
        if (dontShowAgain) {
            // This key is specific to revealing details
            localStorage.setItem('hideRevealWarning', 'true');
        }
        onAccept();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security Reminder</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">Please review this before viewing the plan details.</p>
                
                <div className="space-y-4 text-left mb-8">
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                        <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-gray-800 dark:text-slate-200">
                            Do not share the host's credentials or invite link with anyone. Misuse may result in strong action being taken. <Link to="/rules" className="underline font-semibold text-purple-500">Read more in details</Link>.
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                    <input
                        type="checkbox"
                        id="dont-show-reveal-warning"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="dont-show-reveal-warning" className="ml-2 text-sm text-gray-700 dark:text-slate-300">I understand, don't show this again.</label>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleAccept} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
                        Acknowledge & Reveal
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default RevealWarningModal;