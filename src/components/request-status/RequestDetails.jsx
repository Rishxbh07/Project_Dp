// src/components/request-status/RequestDetails.jsx

import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../common/Loader';
import { Send } from 'lucide-react';

const RequestDetails = ({ bookingId, onUpdate, disabled }) => {
    const [reason, setReason] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setIsRequesting(true);
        const { error } = await supabase.from('credential_requests').insert({
            booking_id: bookingId,
            request_reason: reason,
            status: 'pending'
        });

        if (!error) {
            setReason('');
            onUpdate();
        }
        setIsRequesting(false);
    };

    return (
        <div className={`p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700/50 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-bold text-lg mb-2">Request Details Again</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Lost your password or got kicked out? Ask the host to send the details again.
            </p>
            <form onSubmit={handleRequest}>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why you need the details again (e.g., 'I lost the password')"
                    className="w-full p-2 border rounded-md bg-gray-100 dark:bg-slate-700 dark:border-slate-600"
                    rows="3"
                    disabled={disabled}
                />
                <button type="submit" disabled={isRequesting || disabled} className="w-full mt-2 bg-purple-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
                    {isRequesting ? <Loader/> : <><Send className="w-5 h-5"/>Send Request</>}
                </button>
            </form>
        </div>
    );
};

export default RequestDetails;