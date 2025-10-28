// src/components/common/RequestStatusPreview.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Mail, Clock, AlertTriangle, HelpCircle, Eye, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import Loader from '../components/common/Loader';
import CredentialItem from '../components/common/CredentialItem';
import RevealWarningModal from '../components/common/RevealWarningModal';
import AccessIssueResolver from '../components/common/AccessIssueResolver';

const RequestStatusPreview = ({ bookingId }) => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();

    const fetchRequestStatus = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error: rpcError } = await supabase.rpc('get_latest_credential_details', { 
                p_booking_id: bookingId 
            });

            if (rpcError) throw new Error(rpcError.message);
            
            if (data && data.length > 0) {
                const req = data[0];
                setRequest(req);
                // If details have been seen before (page reload), show them directly
                if (req.status === 'sent_to_user' && localStorage.getItem(`revealed_${bookingId}`)) {
                    setIsRevealed(true);
                }
            } else {
                setRequest({ status: 'pending_host' });
            }
        } catch (err) {
            setError('Could not load joining details status.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        fetchRequestStatus();
    }, [fetchRequestStatus]);

    const handleReveal = async () => {
        setShowWarning(false); // Close the warning modal
        
        // This is the key function: it updates the DB *after* the user clicks
        const { error } = await supabase.rpc('mark_details_as_seen', { 
            p_booking_id: bookingId 
        });

        if (error) {
            setError("Couldn't update the status, but you can still view the details.");
            console.error("Mark as seen error:", error);
        } else {
            // Re-fetch to get the new expiry date
            fetchRequestStatus();
        }
        
        // Reveal the details immediately on the frontend
        setIsRevealed(true);
        localStorage.setItem(`revealed_${bookingId}`, 'true'); // Cache state in browser
    };

    const handleInitialRevealClick = () => {
        // Check if user has dismissed the warning before
        if (localStorage.getItem('hideRevealWarning') === 'true') {
            handleReveal();
        } else {
            setShowWarning(true);
        }
    };
    
    // --- RENDER LOGIC ---

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
                <Loader size="small" />
                <span className="ml-2 text-sm text-gray-500">Loading Status...</span>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500 text-sm">{error}</p>;
    }

    const { status, details, expires_at } = request || {};

    // 1. Host hasn't sent details yet
    if (status === 'pending_host') {
        return (
            <div className="flex items-center p-4 bg-blue-500/10 rounded-lg">
                <Clock className="w-6 h-6 mr-4 text-blue-500" />
                <div>
                    <h4 className="font-bold text-blue-800 dark:text-blue-300">Awaiting Host</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400">The host will send your joining details soon.</p>
                </div>
            </div>
        );
    }
    
    // 2. Details have been sent, but not yet viewed
    if (status === 'sent_to_user' && !isRevealed) {
        return (
             <>
                <button onClick={handleInitialRevealClick} className="w-full text-left p-4 bg-purple-500/10 rounded-lg flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <Mail className="w-6 h-6 text-purple-500" />
                        <div>
                            <h4 className="font-bold text-purple-600 dark:text-purple-400">Details Received!</h4>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Click here to view your credentials.</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <RevealWarningModal 
                    isOpen={showWarning} 
                    onClose={() => setShowWarning(false)} 
                    onAccept={handleReveal} 
                />
            </>
        );
    }

    // 3. Details have been viewed
    if (status === 'sent_to_user' && isRevealed) {
        return (
            <div className="p-4 bg-green-500/10 rounded-lg space-y-3">
                <div className="divide-y divide-green-200 dark:divide-green-800">
                    {details && Object.keys(details).length > 0 ? (
                        Object.entries(details).map(([key, value]) => (
                            <CredentialItem key={key} label={key} value={String(value)} sensitive={key.toLowerCase().includes('password')} />
                        ))
                    ) : (
                         <p className="text-center text-sm text-gray-500 pt-2">No details were provided.</p>
                    )}
                </div>
                {expires_at && <p className="text-xs text-center text-gray-500 pt-2">These details will be hidden for security on {new Date(expires_at).toLocaleDateString()}.</p>}
                <AccessIssueResolver bookingId={bookingId} onUpdate={fetchRequestStatus} />
            </div>
        );
    }
    
    // 4. Details have expired
    if (status === 'expired') {
        return (
            <div className="flex items-center p-4 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 mr-4 text-red-500" />
                <div>
                    <h4 className="font-bold text-red-600 dark:text-red-400">Message Expired</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">The details have been cleared for security. You can request them again if needed.</p>
                    {/* Add a button here to request again if you want */}
                </div>
            </div>
        );
    }

    // Default Fallback
    return (
        <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm text-center">
            <HelpCircle className="w-5 h-5 mx-auto mb-2 text-gray-400"/>
            Status is currently unavailable.
        </div>
    );
};

export default RequestStatusPreview;