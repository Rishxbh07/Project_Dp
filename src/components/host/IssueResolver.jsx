import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AlertTriangle, Send, Eye, EyeOff } from 'lucide-react';
import Loader from '../common/Loader';

const IssueResolver = ({ reportedIssue, booking, onResolved }) => {
    const [formState, setFormState] = useState({});
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState({});
    const [isSending, setIsSending] = useState(false);
    const [formError, setFormError] = useState('');

    // --- THIS IS THE FIX ---
    // We check for the host's custom fields on the listing first.
    // If it's not there, we use the default fields from the service.
    const fieldsConfig = booking?.listings?.required_fields || booking?.listings?.services?.required_fields || [];

    // This useEffect is stable and correctly initializes the form.
    const stableFieldsConfig = JSON.stringify(fieldsConfig);

    useEffect(() => {
        const initialFormState = {};
        const initialShowPassword = {};
        const parsedConfig = JSON.parse(stableFieldsConfig); 
        
        if (parsedConfig.length > 0) {
            parsedConfig.forEach(field => {
                initialFormState[field.id] = '';
                if (field.type === 'password') {
                    initialShowPassword[field.id] = false;
                }
            });
        }
        setFormState(initialFormState);
        setShowPassword(initialShowPassword);
    }, [stableFieldsConfig]);

    if (!reportedIssue) {
        return null;
    }

    const handleInputChange = (id, value) => {
        setFormState(prev => ({ ...prev, [id]: value }));
        setErrors(prev => ({ ...prev, [id]: null }));
        setFormError('');
    };

    const handleSendDetails = async () => {
        setFormError('');
        let isValid = true;
        const newErrors = {};

        fieldsConfig.forEach(field => {
            if (!formState[field.id]?.trim()) {
                newErrors[field.id] = `${field.label} is a required field.`;
                isValid = false;
            }
        });

        setErrors(newErrors);
        if (!isValid) {
            setFormError('Please fill out all required fields to resolve the issue.');
            return;
        }

        setIsSending(true);

        await supabase.from('credential_requests').insert({
            booking_id: booking.id,
            listing_id: booking.listing_id,
            host_id: booking.host_id,
            user_id: booking.user_id,
            request_type: 'details_update',
            request_creation_reason: `Resolving issue: "${reportedIssue.request_creation_reason}"`,
            request_status: 'details_sent',
            joining_details: formState,
            details_sent_at: new Date().toISOString(),
        });

        await supabase
            .from('credential_requests')
            .update({ request_status: 'resolved' })
            .eq('id', reportedIssue.id);

        setIsSending(false);
        onResolved();
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-2 border-red-500">
            <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-100 dark:bg-red-500/20 p-3 rounded-full">
                    <AlertTriangle className="text-red-500" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Resolve User Issue</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">The member has reported a problem.</p>
                </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg mb-5 text-center">
                <p className="font-semibold text-red-800 dark:text-red-300">
                    "{reportedIssue.request_creation_reason}"
                </p>
            </div>

            <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-200">Send Corrected Details:</h3>
            
            <div className="space-y-4">
                {fieldsConfig.length > 0 ? (
                    fieldsConfig.map(field => {
                        const isPasswordField = field.type === 'password';
                        return (
                            <div key={field.id}>
                                <label htmlFor={`resolver-${field.id}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
                                <div className="relative">
                                    <input
                                        id={`resolver-${field.id}`}
                                        name={field.id}
                                        type={isPasswordField ? (showPassword[field.id] ? 'text' : 'password') : 'text'}
                                        value={formState[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.g.value)}
                                        placeholder={field.placeholder}
                                        className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none ${errors[field.id] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 dark:bg-slate-700 focus:ring-purple-500 focus:border-purple-500'}`}
                                        required
                                    />
                                    {isPasswordField && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                                {errors[field.id] && <p className="mt-1 text-xs text-red-600">{errors[field.id]}</p>}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-center text-gray-500 dark:text-slate-400 py-4">
                        This plan has no required fields configured.
                    </p>
                )}
            </div>
            
            {formError && <p className="text-xs text-red-500 text-center pt-3">{formError}</p>}

            <button
                onClick={handleSendDetails}
                disabled={isSending || fieldsConfig.length === 0}
                className="w-full mt-5 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105 disabled:opacity-50"
            >
                {isSending ? <Loader /> : <><Send size={18} /> Send Update & Resolve</>}
            </button>
        </div>
    );
};

export default IssueResolver;