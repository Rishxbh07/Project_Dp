// src/components/request-status/RequestHistory.jsx

import React from 'react';
import { HelpCircle, ArrowDownCircle, CheckCircle, Clock } from 'lucide-react';

const getStatusIcon = (status) => {
    switch (status) {
        case 'pending_host':
            return <HelpCircle className="w-5 h-5 text-yellow-500" />;
        case 'details_sent':
            return <ArrowDownCircle className="w-5 h-5 text-blue-500" />;
        case 'resolved':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'expired':
            return <Clock className="w-5 h-5 text-red-500" />;
        default:
            return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
};

const RequestHistory = ({ requests }) => {
    if (requests.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No request history yet.
            </div>
        );
    }

    const userRequests = requests.filter(r => r.request_status === 'pending_host').length;
    const hostResponses = requests.filter(r => r.request_status === 'details_sent' || r.request_status === 'resolved').length;

    return (
        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700/50">
             <div className="flex justify-around mb-4 text-center">
                <div>
                    <p className="text-2xl font-bold">{userRequests}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">You Asked</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{hostResponses}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Host Sent</p>
                </div>
            </div>
            <div className="space-y-4">
                {requests.map(request => (
                    <div key={request.id} className="flex items-start gap-3">
                        <div>{getStatusIcon(request.request_status)}</div>
                        <div className="flex-1">
                            <p className="font-semibold capitalize">{request.request_status.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{request.request_creation_reason || 'Host sent details'}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {new Date(request.request_created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RequestHistory;