// src/components/request-status/ReportIssueModal.jsx

import React, { useState } from 'react';
import Modal from '../common/Modal'; // Assuming you have a generic Modal component
import Loader from '../common/Loader';

const linkIssues = [
    "Invite link has expired",
    "The address is incorrect",
    "Invalid invite link",
    "Link leads to the wrong group/service",
];

const credentialIssues = [
    "Incorrect password",
    "Invalid username or email",
    "The details are for the wrong account",
    "Credentials are not working",
];

const ReportIssueModal = ({ isOpen, onClose, onSubmit, joiningMethod }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reasons = joiningMethod === 'invite_link' ? linkIssues : credentialIssues;

    const handleSubmit = async () => {
        if (!selectedReason) return;
        setIsSubmitting(true);
        await onSubmit(selectedReason);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Report an Issue">
            <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Please select the issue you are facing. This will help the host resolve it faster.
                </p>
                <div className="space-y-2">
                    {reasons.map(reason => (
                        <button
                            key={reason}
                            onClick={() => setSelectedReason(reason)}
                            className={`w-full text-left p-3 rounded-lg border ${selectedReason === reason ? 'bg-purple-500 text-white border-purple-500' : 'bg-gray-100 dark:bg-slate-700 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                        >
                            {reason}
                        </button>
                    ))}
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedReason || isSubmitting}
                        className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader /> : 'Submit Report'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReportIssueModal;