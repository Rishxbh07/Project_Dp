import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Loader from './Loader';
import { AlertTriangle, PartyPopper } from 'lucide-react';
import Modal from './Modal';

// Helper to configure form fields based on service name
const getServiceInputConfig = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('spotify')) {
        return {
            label: 'Spotify Profile URL',
            placeholder: 'https://open.spotify.com/user/your_user_id',
            type: 'url',
            dbField: 'profile_link'
        };
    }
    if (name.includes('youtube')) {
        return {
            label: 'Google Account Email for YouTube',
            placeholder: 'youremail@gmail.com',
            type: 'email',
            dbField: 'joined_email'
        };
    }
    return {
        label: 'Service Identifier',
        placeholder: 'Enter the required link, email, or ID',
        type: 'text',
        dbField: 'profile_link'
    };
};

const UpdateDetailsModal = ({ isOpen, onClose, bookingId, session, onUpdateSuccess }) => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Form state
    const [inputValue, setInputValue] = useState('');
    const [optionalName, setOptionalName] = useState('');
    const [inputConfig, setInputConfig] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchAccountDetails = async () => {
                if (!bookingId || !session?.user?.id) return;
                setLoading(true);
                setSuccess(false); // Reset success state when modal opens

                const { data, error } = await supabase
                    .from('connected_accounts')
                    .select(`*, service:services(name)`)
                    .eq('booking_id', bookingId)
                    .eq('buyer_id', session.user.id)
                    .single();

                if (error || !data) {
                    setError("Could not find account details for this booking.");
                } else {
                    setAccount(data);
                    const config = getServiceInputConfig(data.service.name);
                    setInputConfig(config);
                    setInputValue(data[config.dbField] || '');
                    setOptionalName(data.service_profile_name || '');
                }
                setLoading(false);
            };
            fetchAccountDetails();
        }
    }, [bookingId, session, isOpen]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!inputValue) {
            setError("The main identifier field cannot be empty.");
            return;
        }
        setIsSubmitting(true);
        setError('');

        const updateData = {
            [inputConfig.dbField]: inputValue,
            service_profile_name: optionalName,
        };

        const { error: updateError } = await supabase
            .from('connected_accounts')
            .update(updateData)
            .eq('id', account.id);
        
        // Also, reset the host's action so they can verify again
        const { error: inviteError } = await supabase
            .from('invite_link')
            .update({ status: 'pending_host_confirmation_retry' })
            .eq('booking_id', bookingId);


        if (updateError || inviteError) {
            setError(`Failed to update details: ${updateError?.message || inviteError?.message}`);
        } else {
            setSuccess(true);
            setTimeout(() => {
                onUpdateSuccess(); // This will close the modal and refresh the parent page
            }, 2000);
        }
        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {loading ? <Loader /> : success ? (
                <div className="text-center p-4">
                    <PartyPopper className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Details Updated!</h2>
                    <p className="text-gray-600 dark:text-slate-300 mt-2">
                        The host has been notified to re-verify your account.
                    </p>
                </div>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                    <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">Update for {account?.service.name}</h2>
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs rounded-lg">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p>Please ensure these details exactly match the account you used to join the host's plan.</p>
                    </div>
                    <div>
                        <label htmlFor="inputValue" className="text-sm font-medium text-gray-500 dark:text-slate-400">
                            {inputConfig?.label}
                        </label>
                        <input
                            id="inputValue"
                            type={inputConfig?.type}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={inputConfig?.placeholder}
                            className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="optionalName" className="text-sm font-medium text-gray-500 dark:text-slate-400">
                            Profile Name (Optional)
                        </label>
                            <input
                            id="optionalName"
                            type="text"
                            value={optionalName}
                            onChange={(e) => setOptionalName(e.target.value)}
                            placeholder="e.g., your display name"
                            className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
                        {isSubmitting ? 'Saving Changes...' : 'Save and Notify Host'}
                    </button>
                </form>
            )}
        </Modal>
    );
};

export default UpdateDetailsModal;