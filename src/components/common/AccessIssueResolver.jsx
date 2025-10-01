// src/components/common/AccessIssueResolver.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Edit, RefreshCw } from 'lucide-react';

const AccessIssueResolver = ({ bookingId }) => {
    return (
        <section className="bg-yellow-500/10 p-6 rounded-2xl border-2 border-dashed border-yellow-500/50 mb-6 text-center animate-in fade-in">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-yellow-600 dark:text-yellow-300 mb-2">Action Required</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-6">
                The host reported an issue with the account details you provided. They were unable to add you to the plan.
                Please update your details or request a refund.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to={`/connect-account/${bookingId}?edit=true`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Edit className="w-4 h-4" /> Update My Details
                </Link>
                <Link
                    to={`/dispute/${bookingId}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Request a Refund
                </Link>
            </div>
        </section>
    );
};

export default AccessIssueResolver;