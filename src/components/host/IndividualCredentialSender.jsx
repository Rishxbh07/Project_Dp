// src/components/host/IndividualCredentialSender.jsx

import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Send, Loader, CheckCircle } from 'lucide-react';

const IndividualCredentialSender = ({ requestId, onSent }) => {
    const [details, setDetails] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        if (!details.trim()) {
            setError('Please enter some details to send.');
            return;
        }
        setIsSending(true);
        setError('');
        setSuccess(false);

        const { error: rpcError } = await supabase.rpc('send_joining_details', {
            p_request_id: requestId,
            p_details: { message: details }
        });

        if (rpcError) {
            setError(`Failed to send details: ${rpcError.message}`);
        } else {
            setSuccess(true);
            setDetails('');
            if (onSent) onSent();
        }
        setIsSending(false);
    };

    if (success) {
        return (
            <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="font-semibold text-green-600 dark:text-green-300">Details sent successfully!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Send or Resend Joining Details</h3>
            <textarea
                placeholder="Enter joining details, credentials, or a message here..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                required
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
                onClick={handleSend}
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
                {isSending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSending ? 'Sending...' : 'Send Details'}
            </button>
        </div>
    );
};

export default IndividualCredentialSender;