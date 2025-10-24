// src/components/common/JoiningStatusStepper.jsx

import React from 'react';
import { Check, Clock, Eye, MessageSquareWarning, Send, ShieldCheck } from 'lucide-react';

const Step = ({ icon, title, status, isLast = false, children }) => {
    // ... (This sub-component remains the same)
    const statusClasses = {
        completed: { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-300' },
        current: { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-300' },
        pending: { bg: 'bg-gray-300 dark:bg-slate-700', text: 'text-gray-500 dark:text-slate-400' },
        error: { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-300' }
    };
    const currentStatus = statusClasses[status] || statusClasses.pending;

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${currentStatus.bg}`}>{icon}</div>
                {!isLast && <div className={`w-0.5 flex-1 ${status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-700'}`}></div>}
            </div>
            <div className="flex-1 pb-8">
                <h4 className={`font-bold ${currentStatus.text}`}>{title}</h4>
                <div className="mt-2 text-sm text-gray-800 dark:text-slate-200">{children}</div>
            </div>
        </div>
    );
};

const JoiningStatusStepper = ({ request, onViewDetails }) => {
    if (!request) {
        return <div className="p-4 text-center bg-gray-100 dark:bg-slate-800 rounded-lg">Preparing your joining process...</div>;
    }

    const { status, confirmation_status } = request;
    const isResolved = status === 'resolved';
    const isIssueReported = confirmation_status === 'issue_reported';

    if (isResolved && !isIssueReported) {
        return (
            <div className="p-6 text-center bg-green-500/10 rounded-2xl">
                <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="font-bold text-lg text-green-600 dark:text-green-300">Delivery Completed</h3>
            </div>
        );
    }
    
    if (isIssueReported && status !== 'resolved') {
        return (
            <div>
                 <Step icon={<Check />} title="Joined Plan" status="completed" />
                 <Step icon={<MessageSquareWarning />} title="Issue Reported" status="error">
                     <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-700 dark:text-yellow-200">
                         The host has been notified. You will receive updated details soon.
                     </div>
                 </Step>
                 <Step icon={<Send />} title="Receive Updated Details" status="pending" isLast/>
            </div>
        );
    }

    const isPendingHost = status === 'pending_host';
    const hasDetails = status === 'sent_to_user';

    return (
        <div>
            <Step icon={<Check />} title="Joined Plan" status="completed" />
            <Step icon={hasDetails ? <Check /> : <Clock />} title="Receive Joining Details" status={hasDetails ? 'completed' : 'current'}>
                {isPendingHost && <p>Waiting for the host to send details. Estimated time: ~2-4 hours.</p>}
            </Step>
            <Step icon={<Eye />} title="View & Confirm Access" status={hasDetails ? 'current' : 'pending'} isLast>
                {hasDetails && (
                    <button onClick={onViewDetails} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 rounded-lg">
                        <Eye className="w-5 h-5" /> View Details
                    </button>
                )}
            </Step>
        </div>
    );
};

export default JoiningStatusStepper;