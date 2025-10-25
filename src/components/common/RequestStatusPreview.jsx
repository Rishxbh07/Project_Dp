// src/components/common/RequestStatusPreview.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Mail, Clock, AlertTriangle, HelpCircle, ChevronRight } from 'lucide-react';
import Loader from './Loader';

const RequestStatusPreview = ({ bookingId }) => {
    const [latestRequest, setLatestRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestRequest = async () => {
            if (!bookingId) return;

            const { data, error } = await supabase.rpc('get_latest_request_status', {
                p_booking_id: bookingId,
            });

            if (data && data.length > 0) {
                setLatestRequest(data[0]);
            }
            setLoading(false);
        };

        fetchLatestRequest();
    }, [bookingId]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center p-4">
                    <Loader />
                </div>
            );
        }

        if (!latestRequest) {
            return (
                <div className="flex items-center">
                    <HelpCircle className="w-6 h-6 mr-4 text-gray-400" />
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">Awaiting Details</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400">The host will send your joining details soon.</p>
                    </div>
                </div>
            );
        }

        const { status, details, message_expires_at } = latestRequest;
        const isExpired = message_expires_at && new Date(message_expires_at) < new Date();
        const hasDetails = details && Object.keys(details).length > 0;

        if (status === 'sent_to_user' && hasDetails && !isExpired) {
            return (
                <Link to={`/request-status/${bookingId}`} className="flex items-center w-full text-left">
                    <Mail className="w-6 h-6 mr-4 text-purple-500" />
                    <div className="flex-1">
                        <h4 className="font-bold text-purple-600 dark:text-purple-400">Joining Details Received</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Please join the plan and confirm access.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
            );
        }

        if (isExpired || (status === 'sent_to_user' && !hasDetails)) {
            return (
                <Link to={`/dispute/${bookingId}`} className="flex items-center w-full text-left">
                    <AlertTriangle className="w-6 h-6 mr-4 text-red-500" />
                    <div className="flex-1">
                        <h4 className="font-bold text-red-600 dark:text-red-400">Action Required</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400">The message has disappeared. If you have a problem, please raise an issue.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
            );
        }

        // Default case for pending_host or other statuses
        return (
            <div className="flex items-center">
                <Clock className="w-6 h-6 mr-4 text-blue-500" />
                <div>
                    <h4 className="font-bold text-blue-600 dark:text-blue-400">Request Sent</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">The host has been notified. We will let you know when they respond.</p>
                </div>
            </div>
        );
    };

    return (
        <section className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            {renderContent()}
        </section>
    );
};

export default RequestStatusPreview;