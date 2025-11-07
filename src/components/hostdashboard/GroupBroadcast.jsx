import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Send, Info } from 'lucide-react';
import Loader from '../common/Loader'; // Import Loader

const GroupBroadcast = ({ listingId }) => {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchListing = async () => {
            if (!listingId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('listings')
                .select('*, services(*)')
                .eq('id', listingId)
                .single();

            if (error) {
                console.error("Error fetching listing for broadcast:", error);
                setError('Could not load listing data.');
            } else {
                setListing(data);
            }
            setLoading(false);
        };
        fetchListing();
    }, [listingId]);

    const handleBroadcast = async () => {
        if (!message) {
            setError('Message cannot be empty.');
            return;
        }
        // ... your broadcast logic
        setSuccess('Broadcast sent successfully!');
        setMessage('');
    };

    // --- THIS IS THE FIX ---
    // Show a loader while the internal fetch is happening
    // and also check if listing.services exists.
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
                <Loader />
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }
    
    // This check prevents the crash
    if (!listing || !listing.services) {
        return <p className="text-red-500">Error: Listing data incomplete.</p>;
    }
    // --- END OF FIX ---

    // This code is now safe
    const hostConfig = listing.services.host_config;

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Group Broadcast</h2>
            
            <div className="relative">
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 pr-12 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                    placeholder="Send an update to all members..."
                />
                <button 
                    onClick={handleBroadcast}
                    className="absolute right-3 top-3 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                >
                    <Send size={18} />
                </button>
            </div>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

            {/* You can now safely read from hostConfig */}
            {hostConfig?.afterbuy && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-blue-500 rounded-lg flex gap-3">
                    <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-200">
                        This plan requires hosts to send: <strong>{hostConfig.afterbuy.join(', ')}</strong>. 
                        Use the "Chat with User" button on each member's card to send details.
                    </p>
                </div>
            )}
        </div>
    );
};

export default GroupBroadcast;