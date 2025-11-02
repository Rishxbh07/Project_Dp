// src/components/host/MemberHistory.jsx

import React from 'react';
import { Clock, CheckCircle, Send, AlertCircle } from 'lucide-react';

const getStatusInfo = (request) => {
    // Check for reported issue first, as it's a special state
    if (request.user_acess_confirmation_status === 'issue_reported') {
        return { icon: <AlertCircle className="text-red-500" />, text: 'User reported an issue' };
    }

    switch (request.request_status) {
        case 'pending_host': return { icon: <Clock className="text-yellow-500" />, text: 'User requested details' };
        case 'details_sent': return { icon: <Send className="text-blue-500" />, text: 'You sent details' };
        case 'resolved': return { icon: <CheckCircle className="text-green-500" />, text: 'User confirmed access' };
        default: return { icon: <Clock className="text-gray-400" />, text: 'Status updated' };
    }
};

const MemberHistory = ({ requests }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Interaction History</h2>
            {requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map(req => {
                        const { icon, text } = getStatusInfo(req);
                        return (
                            <div key={req.id} className="flex items-start gap-4">
                                <div className="mt-1">{icon}</div>
                                <div>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{text}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(req.request_created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No interaction history yet.</p>
            )}
        </div>
    );
};

export default MemberHistory;