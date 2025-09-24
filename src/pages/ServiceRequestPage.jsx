import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Send, ChevronDown } from 'lucide-react'; // Import ChevronDown for the custom arrow

const ServiceRequestPage = ({ session }) => {
    const navigate = useNavigate();
    const [serviceName, setServiceName] = useState('');
    const [serviceUrl, setServiceUrl] = useState('');
    const [requestType, setRequestType] = useState('Buy');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!serviceName || !serviceUrl) {
            setError('Please fill in all required fields.');
            return;
        }
        
        try {
            new URL(serviceUrl);
        } catch (_) {
            setError('Please enter a valid URL for the service website.');
            return;
        }

        setSubmitting(true);
        setError('');

        const { data, error } = await supabase
            .from('service_requests')
            .insert([{
                user_id: session?.user?.id,
                service_name: serviceName,
                service_url: serviceUrl,
                notes: notes,
                requesting_to: requestType,
            }]);

        if (error) {
            setError(`Error submitting request: ${error.message}`);
        } else {
            setSuccess(true);
            setTimeout(() => navigate('/explore'), 4000);
        }
        setSubmitting(false);
    };

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/explore" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors text-2xl font-bold w-10 text-left">
                        ←
                    </Link>
                    <h1 className="text-xl font-bold text-center">Request a Service</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {success ? (
                    <div className="text-center p-8 bg-green-500/10 rounded-2xl">
                        <h2 className="text-2xl font-bold text-green-500 dark:text-green-300">Request Submitted!</h2>
                        <p className="text-gray-600 dark:text-slate-300 mt-2">You will receive an update very soon. Thank you, we care about your needs!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="serviceName" className="text-sm font-medium text-gray-500 dark:text-slate-400">Service Name *</label>
                            <input
                                id="serviceName"
                                type="text"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                                placeholder="e.g., Disney+ Hotstar"
                                className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="serviceUrl" className="text-sm font-medium text-gray-500 dark:text-slate-400">Service Website *</label>
                            <input
                                id="serviceUrl"
                                type="url"
                                value={serviceUrl}
                                onChange={(e) => setServiceUrl(e.target.value)}
                                placeholder="https://www.hotstar.com"
                                className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="requestType" className="text-sm font-medium text-gray-500 dark:text-slate-400">You are requesting this service to...</label>
                            {/* --- MODIFIED: Custom styled select --- */}
                            <div className="relative mt-1">
                                <select
                                    id="requestType"
                                    value={requestType}
                                    onChange={(e) => setRequestType(e.target.value)}
                                    className="appearance-none w-full p-3 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10" // Add pr-10 for padding for the custom arrow
                                >
                                    <option value="Buy">Buy a spot</option>
                                    <option value="Host">Host a plan</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="notes" className="text-sm font-medium text-gray-500 dark:text-slate-400">Additional Notes (Optional)</label>
                            <textarea
                                id="notes"
                                rows="4"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any specific plans or features you're interested in?"
                                className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            ></textarea>
                        </div>

                        {error && <p className="text-red-500 text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

export default ServiceRequestPage;