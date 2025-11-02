// src/components/request-status/JoiningDetails.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../common/Loader';
import { Mail, Lock, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import RevealWarningModal from '../common/RevealWarningModal';
import ReportIssueModal from './ReportIssueModal'; // Import the new modal
import CredentialItem from '../common/CredentialItem';

const JoiningDetails = ({ request, bookingId, listing, onUpdate }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('hideRevealWarning') === 'true') {
            setIsRevealed(true);
        }
    }, []);

    const handleReveal = useCallback(async () => {
        if (request && !request.details_seen_at) {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            await supabase.from('credential_requests').update({
                details_seen_at: now.toISOString(),
                message_expires_at: expiresAt.toISOString(),
            }).eq('id', request.id);
            onUpdate();
        }
    }, [request, onUpdate]);

    useEffect(() => {
        if (isRevealed) {
            handleReveal();
        }
    }, [isRevealed, handleReveal]);

    const handleConfirmation = async () => {
        setIsConfirming(true);
        const now = new Date();
        const { error } = await supabase.from('credential_requests').update({
            user_acess_confirmation_status: 'confirmed',
            confirmed_at: now.toISOString(),
        }).eq('id', request.id);
        if (!error) onUpdate();
        setIsConfirming(false);
    };

    const handleSubmitReport = async (reason) => {
        setIsReporting(true);
        // Step 1: Mark the current request as having an issue
        await supabase.from('credential_requests').update({
            user_acess_confirmation_status: 'issue_reported'
        }).eq('id', request.id);

        // Step 2: Create a new request to the host with the reason
        await supabase.from('credential_requests').insert({
            booking_id: bookingId,
            listing_id: listing.id,
            host_id: listing.host_id,
            user_id: request.user_id,
            request_type: 're-request',
            request_creation_reason: reason,
            request_status: 'pending_host',
        });

        onUpdate();
        setIsReporting(false);
    };

    if (!request) {
        return <div className="p-4 bg-blue-500/10 text-blue-600 rounded-lg text-center font-semibold">Waiting for Host...</div>;
    }

    if (request.user_acess_confirmation_status === 'issue_reported') {
        return (
            <div className="p-4 bg-orange-500/10 text-orange-600 rounded-lg text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-bold">Issue Reported</h4>
                <p className="text-sm">We've notified the host. They will send updated details soon.</p>
            </div>
        );
    }

    const { request_status, joining_details } = request;

    if (request_status === 'expired') {
        return (
            <div className="p-4 bg-red-500/10 text-center rounded-lg">
                <h4 className="font-bold text-red-500 mb-2">Details Expired</h4>
                <p className="text-sm text-red-700 dark:text-red-400">The details have been wiped for security.</p>
            </div>
        );
    }

    if (request.user_acess_confirmation_status === 'confirmed') {
        return <div className="p-4 bg-green-500/10 text-green-600 rounded-lg text-center font-semibold">Access Confirmed</div>;
    }

    if (!isRevealed && joining_details) {
        return (
             <>
                <section className="bg-yellow-500/10 p-6 rounded-2xl border-2 border-dashed border-yellow-500/50 text-center">
                    <Mail className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-yellow-600 dark:text-yellow-300">Credentials are Ready</h3>
                    <button onClick={() => setShowWarning(true)} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-5 rounded-lg">
                        <Lock className="w-4 h-4 inline-block mr-2"/>Reveal Details
                    </button>
                </section>
                <RevealWarningModal isOpen={showWarning} onClose={() => setShowWarning(false)} onAccept={() => { setIsRevealed(true); setShowWarning(false); }} />
            </>
        );
    }

    return (
        <>
            <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700/50">
                <h3 className="font-bold text-lg mb-2">Joining Credentials</h3>
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                    {joining_details && Object.keys(joining_details).length > 0 ? (
                        Object.entries(joining_details).map(([key, value]) => (
                            <CredentialItem key={key} label={key} value={String(value)} sensitive={key.toLowerCase().includes('password')} />
                        ))
                    ) : <p className="text-sm text-center py-3">No credentials have been provided by the host yet.</p>}
                </div>
                {joining_details && (
                    <div className="mt-4 space-y-2">
                        <button onClick={handleConfirmation} disabled={isConfirming} className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
                           {isConfirming ? <Loader/> : <><CheckCircle className="w-5 h-5"/>I've Joined</>}
                        </button>
                        <button onClick={() => setShowReportModal(true)} disabled={isReporting} className="w-full bg-red-500 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
                           <AlertTriangle className="w-5 h-5"/>Report a Problem
                        </button>
                    </div>
                )}
            </div>
            {listing && (
                 <ReportIssueModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    onSubmit={handleSubmitReport}
                    joiningMethod={listing.joining_method}
                 />
            )}
        </>
    );
};

export default JoiningDetails;