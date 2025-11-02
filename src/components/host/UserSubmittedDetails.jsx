import React from 'react';
import { User, Mail, Link as LinkIcon, Info } from 'lucide-react';

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-700">
        <span className="text-sm text-gray-500 dark:text-slate-400">{label}:</span>
        <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{value}</span>
    </div>
);

const UserSubmittedDetails = ({ connectedAccount, sharingMethod }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">User's Submitted Details</h3>
            {sharingMethod === 'credentials' ? (
                <p className="text-sm text-center text-gray-500 dark:text-slate-400 py-4">
                    This is a credential-based plan. No details are collected from the user.
                </p>
            ) : connectedAccount ? (
                <div className="space-y-2">
                    {connectedAccount.service_profile_name && <DetailRow label="Profile Name" value={connectedAccount.service_profile_name} />}
                    {connectedAccount.joined_email && <DetailRow label="Email" value={connectedAccount.joined_email} />}
                    {connectedAccount.service_uid && <DetailRow label="Service UID" value={connectedAccount.service_uid} />}
                    {connectedAccount.profile_link && <DetailRow label="Profile Link" value={connectedAccount.profile_link} />}
                </div>
            ) : (
                 <p className="text-sm text-center text-gray-500 dark:text-slate-400 py-4">
                    User has not submitted their details yet.
                </p>
            )}
        </div>
    );
};

export default UserSubmittedDetails;