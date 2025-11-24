import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const UserConfigForm = ({ config, value, onChange, error, setError, setExtractedValue }) => {
    if (!config) return null;

    const handleChange = (val) => {
        onChange(val);
        setError('');
        
        // Validation Logic
        if (config.validationRegex) {
            // Regex comes as string from JSON, need to convert if it's not a Regex object
            let regex = config.validationRegex;
            if (typeof regex === 'string') {
                try {
                    // Extract pattern and flags if stored as string like "/abc/i"
                    const match = regex.match(new RegExp('^/(.*?)/([gimy]*)$'));
                    regex = match ? new RegExp(match[1], match[2]) : new RegExp(regex);
                } catch (e) {
                    console.error("Invalid regex in user_config", e);
                    regex = /.+/; // Fallback
                }
            }

            const match = val.match(regex);
            if (match) {
                 // If extractValue is a function (hardcoded fallback) use it, else default to full match
                 const extracted = config.extractValue ? config.extractValue(match) : match[0];
                 setExtractedValue(extracted);
            } else {
                setExtractedValue(null);
            }
        }
    };

    return (
        <section className="mb-6 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 px-1">Connect Your Account</h3>
            <div className="p-5 md:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                        {config.label} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={config.type || 'text'}
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={config.placeholder}
                            className={`w-full p-3.5 bg-gray-50 dark:bg-black/20 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-white/10 focus:ring-purple-500'} focus:outline-none focus:ring-2 transition-all`}
                        />
                        {value && !error && !config.errorMessage && ( // Simple visual check
                             <div className="absolute right-3 top-3.5 text-gray-400"><CheckCircle2 className="w-5 h-5" /></div>
                        )}
                    </div>
                    {error && (
                        <p className="flex items-center gap-1 mt-2 text-xs text-red-500 font-medium animate-pulse">
                            <AlertCircle className="w-3 h-3" /> {error}
                        </p>
                    )}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                        {config.optionalLabel || 'Profile Name (Optional)'}
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-full p-3.5 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                </div>
            </div>
        </section>
    );
};

export default UserConfigForm;