import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Send, ChevronDown, Check, Globe, LayoutGrid, MessageSquare, ArrowLeft } from 'lucide-react';

// --- Custom Select Component ---
const CustomSelect = ({ label, value, options, onChange, placeholder, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    // Find the label for the current value
    const selectedLabel = options.find(opt => opt.value === value)?.label || value;

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 bg-gray-50 dark:bg-slate-800/50 text-left ${
                    isOpen 
                        ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg' 
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && <Icon className={`w-5 h-5 ${value ? 'text-purple-500' : 'text-gray-400'}`} />}
                    <span className={`block truncate ${value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
                        {value ? selectedLabel : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 custom-scrollbar">
                    <div className="p-1.5">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                                    value === option.value
                                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold'
                                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <span>{option.label}</span>
                                {value === option.value && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ServiceRequestPage = ({ session }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        serviceName: '',
        serviceUrl: '',
        category: '',
        requestType: 'Buy', // Default
        notes: ''
    });
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const CATEGORIES = [
        { value: 'Music', label: 'Music' },
        { value: 'AI & Productivity', label: 'AI & Productivity' },
        { value: 'Software', label: 'Software (Office / General Tools)' },
        { value: 'Security', label: 'Security (VPN / Privacy)' },
        { value: 'Education', label: 'Education / Learning' },
        { value: 'Cloud Storage', label: 'Cloud Storage' },
        { value: 'Games', label: 'Games (Subscriptions / Platforms)' },
        { value: 'Ecommerce', label: 'E-commerce / Shopping' },
        { value: 'Other', label: 'Other' }
    ];

    const REQUEST_TYPES = [
        { value: 'Buy', label: 'I want to Buy a spot' },
        { value: 'Host', label: 'I want to Host a plan' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.serviceName || !formData.serviceUrl || !formData.category) {
            setError('Please fill in all required fields (Name, Link, Category).');
            window.scrollTo(0,0);
            return;
        }
        
        try {
            new URL(formData.serviceUrl); // Simple URL validation
        } catch (_) {
            setError('Please enter a valid URL (e.g., https://netflix.com).');
            return;
        }

        setSubmitting(true);
        setError('');

        const { error: dbError } = await supabase
            .from('service_requests')
            .insert([{
                user_id: session?.user?.id,
                service_name: formData.serviceName,
                service_url: formData.serviceUrl,
                category: formData.category, // Now sending category
                requesting_to: formData.requestType,
                notes: formData.notes,
            }]);

        if (dbError) {
            console.error("Submission error:", dbError);
            setError(`Failed to submit: ${dbError.message}`);
        } else {
            setSuccess(true);
            setTimeout(() => navigate('/explore'), 3000);
        }
        setSubmitting(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-green-100 dark:border-green-900/30 text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Sent!</h2>
                    <p className="text-gray-500 dark:text-slate-300">
                        Thanks for your suggestion. We'll review <strong>{formData.serviceName}</strong> and notify you once it's available.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-[#0b1221] min-h-screen font-sans text-gray-900 dark:text-white pb-24">
            {/* --- Header --- */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0b1221]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link 
                        to="/explore" 
                        className="p-2 -ml-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold">Request a Service</h1>
                    <div className="w-9"></div> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Missing Something?</h2>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">
                        Tell us which service you'd like to see on dapBuddy.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Service Name Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Service Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.serviceName}
                            onChange={(e) => handleInputChange('serviceName', e.target.value)}
                            placeholder="e.g. Disney+ Hotstar"
                            className="w-full p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium"
                        />
                    </div>

                    {/* Service URL Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Official Website <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Globe className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="url"
                                value={formData.serviceUrl}
                                onChange={(e) => handleInputChange('serviceUrl', e.target.value)}
                                placeholder="https://www.hotstar.com"
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Select */}
                        <CustomSelect
                            label="Category *"
                            value={formData.category}
                            options={CATEGORIES}
                            onChange={(val) => handleInputChange('category', val)}
                            placeholder="Select Category"
                            icon={LayoutGrid}
                        />

                        {/* Request Type Select */}
                        <CustomSelect
                            label="I want to..."
                            value={formData.requestType}
                            options={REQUEST_TYPES}
                            onChange={(val) => handleInputChange('requestType', val)}
                            placeholder="Select Intent"
                            icon={Check} 
                        />
                    </div>

                    {/* Notes Textarea */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Additional Notes (Optional)
                        </label>
                        <div className="relative">
                            <div className="absolute top-4 left-4 pointer-events-none">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                            </div>
                            <textarea
                                rows="4"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Any specific plan tier or features you're interested in?"
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 disabled:shadow-none"
                        >
                            {submitting ? (
                                <span>Submitting...</span>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ServiceRequestPage;