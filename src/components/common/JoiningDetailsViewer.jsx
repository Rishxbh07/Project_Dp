// src/components/common/JoiningDetailsViewer.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Hourglass, Loader } from 'lucide-react';
import Modal from './Modal';

const JoiningDetailsViewer = ({ isOpen, onClose, booking, request, onStatusChange }) => {
    const [revealedDetails, setRevealedDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState('');
    const [issueReason, setIssueReason] = useState('');
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

    useEffect(() => {
        // Automatically fetch details when the modal is opened
        if (isOpen && !revealedDetails) {
            handleRevealDetails();
        }
    }, [isOpen]);

    useEffect(() => {
        let timer;
        if (revealedDetails && request?.message_expires_at) {
            const updateCountdown = () => {
                const now = new Date();
                const expiry = new Date(request.message_expires_at);
                const diff = expiry - now;

                if (diff <= 0) {
                    setCountdown('Expired');
                    clearInterval(timer);
                    return;
                }
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setCountdown(`${h}h ${m}m ${s}s`);
            };
            updateCountdown();
            timer = setInterval(updateCountdown, 1000);
        }
        return () => clearInterval(timer);
    }, [revealedDetails, request?.message_expires_at]);

    const handleRevealDetails = async () => {
        setIsLoading(true);
        setError('');
        const { data, error } = await supabase.rpc('get_joining_details', {
            p_booking_id: booking.id
        });

        if (error) {
            setError(`Failed to fetch details: ${error.message}`);
        } else {
            setRevealedDetails(data.details);
            // Notify the parent page that the request data has been updated (e.g., seen_at)
            onStatusChange();
        }
        setIsLoading(false);
    };

    const handleConfirmation = async (isSuccess, reason = '') => {
        if (isSubmittingIssue) return;
        setIsSubmittingIssue(true);
        setError('');
        const { error } = await supabase.rpc('handle_access_confirmation', {
            p_request_id: request.id,
            p_success: isSuccess,
            p_reason: reason
        });

        if (error) {
            setError(`Action failed: ${error.message}`);
        } else {
            onStatusChange(); // Tell parent to refresh
            onClose(); // Close the modal on success
        }
        setIsSubmittingIssue(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Joining Details</h3>
                {isLoading && <div className="flex justify-center items-center h-48"><Loader /></div>}
                
                {error && <p className="my-4 text-center text-sm text-red-500">{error}</p>}

                {revealedDetails && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
                             <div className="text-center p-2 mb-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 rounded-md text-xs font-semibold">
                                 Details expire in: {countdown}
                             </div>
                            <p className="text-base whitespace-pre-wrap">{revealedDetails.message}</p>
                        </div>
                        <div className="p-2 text-center bg-blue-500/10 rounded-md text-xs text-blue-500 dark:text-blue-300">
                           <Hourglass className="inline w-3 h-3 mr-1"/> Access will be auto-confirmed 1 hour after viewing.
                        </div>

                        {!isSubmittingIssue ? (
                             <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setIsSubmittingIssue(true)} className="bg-red-500/10 text-red-500 font-semibold py-2 rounded-lg hover:bg-red-500/20">Report Issue</button>
                                <button onClick={() => handleConfirmation(true, 'User confirmed access.')} className="bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700">It Works!</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <textarea 
                                    value={issueReason}
                                    onChange={(e) => setIssueReason(e.target.value)}
                                    placeholder="e.g., The password was incorrect, the invite link has expired..."
                                    className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-700 rounded-md border border-gray-300 dark:border-slate-600"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsSubmittingIssue(false)} className="px-4 py-2 text-sm font-semibold rounded-lg border dark:border-slate-600">Cancel</button>
                                    <button onClick={() => handleConfirmation(false, issueReason)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white">Submit Issue</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default JoiningDetailsViewer;