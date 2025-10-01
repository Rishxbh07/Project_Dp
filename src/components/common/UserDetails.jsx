import React from 'react';
import { Copy, Check } from 'lucide-react';
import Loader from './Loader';

const UserDetails = ({ booking }) => {
    const [copiedField, setCopiedField] = React.useState(null);

    // Get the connected account directly from the booking prop. No data fetching occurs here.
    const connectedAccount = (booking.connected_accounts && booking.connected_accounts.length > 0) 
        ? booking.connected_accounts[0] 
        : null;

    const handleCopy = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // If the user hasn't provided details yet, this component shows a clear waiting message.
    if (!connectedAccount) {
        return (
            <div className="text-center text-sm text-gray-500 dark:text-slate-400 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <Loader />
                Waiting for the user to submit their account details...
            </div>
        );
    }

    // If details exist, they are displayed here.
    return (
        <div className="space-y-2 text-xs p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
            {connectedAccount.service_profile_name && (
                <div className="grid grid-cols-3 gap-x-2">
                    <span className="text-gray-500 dark:text-slate-400 col-span-1 text-left">Profile Name:</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200 col-span-2 text-right truncate">{connectedAccount.service_profile_name}</span>
                </div>
            )}
            {connectedAccount.joined_email && (
                <div className="grid grid-cols-3 gap-x-2 items-center">
                    <span className="text-gray-500 dark:text-slate-400 col-span-1 text-left">Email:</span>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                        <span className="font-semibold truncate">{connectedAccount.joined_email}</span>
                        <button onClick={() => handleCopy(connectedAccount.joined_email, 'email')} className="text-gray-400 hover:text-purple-500">
                            {copiedField === 'email' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}
            {connectedAccount.service_uid && (
                <div className="grid grid-cols-3 gap-x-2 items-center">
                    <span className="text-gray-500 dark:text-slate-400 col-span-1 text-left">Service UID:</span>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                        <span className="font-semibold truncate">{connectedAccount.service_uid}</span>
                        <button onClick={() => handleCopy(connectedAccount.service_uid, 'uid')} className="text-gray-400 hover:text-purple-500">
                            {copiedField === 'uid' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;