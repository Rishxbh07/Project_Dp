import React from 'react';
import { Send } from 'lucide-react';

const GroupBroadcast = ({ service }) => {
    // Fallback to an empty object if host_config is null/undefined
    const hostConfig = service.host_config || {};
    const formFields = hostConfig.afterbuy || [];

    const renderFormFields = () => {
        // If there are no configured fields, show a message.
        if (formFields.length === 0) {
            return <p className="text-xs text-center text-gray-500 dark:text-slate-400">No broadcast fields configured for this service.</p>;
        }

        return formFields.map(fieldName => {
            const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const type = fieldName.includes('password') ? 'password' : 'text';
            const placeholder = `Enter new ${label.toLowerCase()}...`;
            
            return (
                <div key={fieldName}>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
                    <input 
                        type={type} 
                        placeholder={placeholder} 
                        className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg p-2 mt-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
            );
        });
    };

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Group Broadcast</h3>
            <form className="space-y-4">
                {renderFormFields()}
                <button 
                    type="submit" 
                    className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
                    disabled={formFields.length === 0}
                >
                    <Send className="w-5 h-5" /> Send to All Members
                </button>
            </form>
        </section>
    );
};

export default GroupBroadcast;