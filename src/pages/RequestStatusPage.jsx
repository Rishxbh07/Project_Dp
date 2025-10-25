// src/pages/RequestStatusPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { ChevronRight, Clock, HelpCircle, ShieldCheck, Mail, AlertTriangle, Lock, CheckCircle } from 'lucide-react';
import RevealWarningModal from '../components/common/RevealWarningModal';
import CredentialItem from '../components/common/CredentialItem';

const CurrentStatusCard = ({ request, bookingId, onUpdate }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    // This checks localStorage to see if the user has previously opted out.
    useEffect(() => {
        if (localStorage.getItem('hideRevealWarning') === 'true') {
            setIsRevealed(true);
        }
    }, []);

    const handleConfirmation = async () => {
        setIsConfirming(true);
        const { error } = await supabase.from('credential_requests').update({ status: 'resolved' }).eq('booking_id', bookingId);
        if (!error) onUpdate();
        setIsConfirming(false);
    };

    const handleRequestAgain = async () => {
        setIsRequesting(true);
        const { error } = await supabase.from('credential_requests').insert({ booking_id: bookingId, request_reason: 'Expired credentials re-request' });
        if (!error) onUpdate();
        setIsRequesting(false);
    };

    if (!request) {
        return <div className="p-4 bg-blue-500/10 text-blue-600 rounded-lg text-center font-semibold">Waiting for Host...</div>;
    }

    const { status, details } = request;

    if (status === 'expired') {
        return (
            <div className="p-4 bg-red-500/10 text-center rounded-lg">
                <h4 className="font-bold text-red-500 mb-2">Details Expired</h4>
                <p className="text-sm text-red-700 dark:text-red-400 mb-3">The details have been wiped for security.</p>
                <button onClick={handleRequestAgain} disabled={isRequesting} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-sm">
                    {isRequesting ? <Loader/> : 'Request Again'}
                </button>
            </div>
        );
    }

    if (status === 'resolved') {
        return <div className="p-4 bg-green-500/10 text-green-600 rounded-lg text-center font-semibold">Access Confirmed</div>;
    }

    if (!isRevealed) {
        return (
             <>
                <section className="bg-yellow-500/10 p-6 rounded-2xl border-2 border-dashed border-yellow-500/50 text-center">
                    <Mail className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-yellow-600 dark:text-yellow-300">Credentials are Ready</h3>
                    <button onClick={() => setShowWarning(true)} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-5 rounded-lg">
                        <Lock className="w-4 h-4 inline-block mr-2"/>Reveal Details
                    </button>
                </section>
                
                {/* --- THIS IS THE CORRECTED LINE --- */}
                <RevealWarningModal 
                    isOpen={showWarning} 
                    onClose={() => setShowWarning(false)} 
                    onAccept={() => { setIsRevealed(true); setShowWarning(false); }} 
                />
            </>
        );
    }

    return (
        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700/50">
            <h3 className="font-bold text-lg mb-2">Joining Credentials</h3>
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {details && Object.keys(details).length > 0 ? (
                    Object.entries(details).map(([key, value]) => (
                        <CredentialItem key={key} label={key} value={String(value)} sensitive={key.toLowerCase().includes('password')} />
                    ))
                ) : <p className="text-sm text-center py-3">No credentials provided.</p>}
            </div>
            <div className="mt-4">
                <button onClick={handleConfirmation} disabled={isConfirming} className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
                   {isConfirming ? <Loader/> : <><CheckCircle className="w-5 h-5"/>I've Joined</>}
                </button>
            </div>
        </div>
    );
};

const RequestStatusPage = () => {
    const { bookingId } = useParams();
    const [latestRequest, setLatestRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLatestDetails = useCallback(async () => {
        if (!bookingId) return;
        setLoading(true);

        const { data, error: rpcError } = await supabase.rpc('get_latest_credential_details', { 
            p_booking_id: bookingId 
        });

        if (rpcError) {
            setError('Could not load request details.');
            console.error(rpcError);
        } else if (data && data.length > 0) {
            setLatestRequest(data[0]);
        } else {
            setLatestRequest(null);
        }
        setLoading(false);
    }, [bookingId]);

    useEffect(() => {
        fetchLatestDetails();
    }, [fetchLatestDetails]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 min-h-screen">
            <header className="sticky top-0 z-20 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`/subscription/${bookingId}`} className="text-purple-500 hover:text-purple-600 transition-colors p-2 rounded-full">
                        <ChevronRight className="w-6 h-6 transform rotate-180" />
                    </Link>
                    <h1 className="text-xl font-bold">Request Status</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 md:p-6">
                <h2 className="text-lg font-semibold mb-3">Current Status</h2>
                <CurrentStatusCard request={latestRequest} bookingId={bookingId} onUpdate={fetchLatestDetails} />
            </main>
        </div>
    );
};

export default RequestStatusPage;