import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Mail, Clock, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import Loader from '../common/Loader';

const JoiningDetailsViewer = ({ bookingId }) => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            const { data } = await supabase.rpc('get_latest_credential_details', { 
                p_booking_id: bookingId 
            });
            setRequest(data?.[0] || { status: 'pending_host' });
            setLoading(false);
        };
        fetchStatus();
    }, [bookingId]);

    const renderStatus = () => {
        if (loading) {
            return <div className="flex justify-center py-4"><Loader size="small" /></div>;
        }

        switch (request?.status) {
            case 'sent_to_user':
                return (
                    <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="font-semibold text-gray-800 dark:text-white">Details are ready!</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Your joining details have been sent by the host.</p>
                    </div>
                );
            case 'issue_reported':
                return (
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                        <p className="font-semibold text-gray-800 dark:text-white">Action Required</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">The host reported an issue with your details.</p>
                    </div>
                );
            case 'pending_host':
            default:
                return (
                    <div className="text-center">
                        <Clock className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <p className="font-semibold text-gray-800 dark:text-white">Awaiting Host</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">The host will send your details soon.</p>
                    </div>
                );
        }
    };

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Joining Details</h3>
            {renderStatus()}
            {/* The 'block' class has been removed from here */}
            <Link to={`/request-status/${bookingId}`} className="mt-6 w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-semibold py-3 rounded-lg text-center flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                Manage <ChevronRight className="w-4 h-4" />
            </Link>
        </section>
    );
};

export default JoiningDetailsViewer;