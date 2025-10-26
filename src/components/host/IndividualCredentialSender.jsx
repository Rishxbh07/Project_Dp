// src/components/host/IndividualCredentialSender.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Send, Loader, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
// FIX: Import the functions you just exported
import { validateAgainstForbiddenWords, validateLanguage, validateInviteLink } from './BroadcastDetailsInput';

const IndividualCredentialSender = ({ requestId, onSent, fieldsConfig = [], sharingMethod, serviceId, isResend = false }) => {
    const [formState, setFormState] = useState({});
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState({});
    const [isSending, setIsSending] = useState(false);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState(false);

    // Initialize form state based on fieldsConfig
    useEffect(() => {
        const initialFormState = {};
        const initialErrors = {};
        const initialShowPassword = {};
        fieldsConfig.forEach(field => {
            initialFormState[field.id] = '';
            initialErrors[field.id] = null;
            if (field.type === 'password') {
                initialShowPassword[field.id] = false;
            }
        });
        setFormState(initialFormState);
        setErrors(initialErrors);
        setShowPassword(initialShowPassword);
    }, [fieldsConfig]);

    const handleInputChange = (id, value) => {
        setFormState(prev => ({ ...prev, [id]: value }));
        setErrors(prev => ({ ...prev, [id]: null })); // Clear error on change
        setFormError(''); // Clear general form error
    };

    const validateField = (field, value) => {
        let error = validateLanguage(value) || validateAgainstForbiddenWords(value);
        if (!error && field.validation === 'invite_link') {
            error = validateInviteLink(value, serviceId);
        }
        return error;
    };

    const handleSend = async () => {
        setFormError('');
        setSuccess(false);
        let isValid = true;
        const newErrors = {};

        // Determine if we are using the dynamic form or the fallback textarea
        const useDynamicForm = sharingMethod && (sharingMethod === 'credentials' || sharingMethod === 'invite_link') && fieldsConfig.length > 0;
        let detailsToSend = {};

        if (useDynamicForm) {
            // Validate all dynamic fields
            fieldsConfig.forEach(field => {
                if (!formState[field.id]?.trim()) {
                    newErrors[field.id] = `${field.label} cannot be empty.`;
                    isValid = false;
                } else {
                    const error = validateField(field, formState[field.id]);
                    if (error) {
                        newErrors[field.id] = error;
                        isValid = false;
                    }
                }
            });
            detailsToSend = formState; // Send the structured formState object
        } else {
            // Validate the fallback textarea
            if (!formState['message']?.trim()) {
                newErrors['message'] = 'Please enter some details to send.';
                isValid = false;
            }
            detailsToSend = { message: formState['message'] || '' }; // Send the simple message object
        }

        setErrors(newErrors);
        if (!isValid) {
            setFormError(useDynamicForm ? 'Please fix the errors above.' : newErrors['message']);
            return;
        }

        setIsSending(true);

        const { error: rpcError } = await supabase.rpc('send_joining_details', {
            p_request_id: requestId,
            p_details: detailsToSend
        });

        if (rpcError) {
            setFormError(`Failed to send details: ${rpcError.message}`);
        } else {
            setSuccess(true);
            if (onSent) onSent();
        }
        setIsSending(false);
    };

    if (success && !isResend) { // Only hide the form completely on initial success
        return (
            <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="font-semibold text-green-600 dark:text-green-300">Details sent successfully!</p>
            </div>
        );
    }

    // Determine if we should show the dynamic form
    const showDynamicForm = sharingMethod && (sharingMethod === 'credentials' || sharingMethod === 'invite_link') && fieldsConfig.length > 0;

    return (
        <div className={`space-y-3 p-4 rounded-2xl border ${isResend ? 'bg-transparent border-none p-0' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
            {!isResend && <h3 className="font-bold text-lg text-gray-900 dark:text-white">Send Joining Details</h3>}

            {showDynamicForm ? (
                <>
                    {fieldsConfig.map(field => {
                         const isPasswordField = field.type === 'password';
                         return (
                            <div key={field.id}>
                                <label htmlFor={`individual-${field.id}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
                                <div className="relative">
                                    <input
                                        id={`individual-${field.id}`}
                                        name={field.id}
                                        type={isPasswordField ? (showPassword[field.id] ? 'text' : 'password') : 'text'}
                                        value={formState[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        placeholder={field.placeholder}
                                        className={`block w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none ${errors[field.id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 dark:bg-slate-800 focus:ring-purple-500 focus:border-purple-500'}`}
                                        required
                                    />
                                    {isPasswordField && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            aria-label={showPassword[field.id] ? "Hide password" : "Show password"}
                                        >
                                            {showPassword[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                                {errors[field.id] && <p className="mt-1 text-xs text-red-600">{errors[field.id]}</p>}
                            </div>
                         );
                    })}
                </>
            ) : (
                 // Fallback for services without specific fields or simple message methods
                 <textarea
                     placeholder="Enter joining details, credentials, or a message here..."
                     value={formState['message'] || ''} // Use a default key like 'message'
                     onChange={(e) => handleInputChange('message', e.target.value)}
                     className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                     rows="3"
                     required
                 />
            )}

            {formError && <p className="text-xs text-red-500 text-center">{formError}</p>}
            {success && isResend && <p className="text-xs text-green-500 text-center py-2">Details re-sent successfully!</p>}

            <button
                onClick={handleSend}
                disabled={isSending}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 ${isResend ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 text-xs px-3' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            >
                {isSending ? <Loader className="w-4 h-4 animate-spin" /> : (isResend ? <RefreshCw className="w-4 h-4" /> : <Send className="w-4 h-4" />)}
                {isSending ? 'Sending...' : (isResend ? 'Resend Details' : 'Send Details')}
            </button>
        </div>
    );
};

export default IndividualCredentialSender;