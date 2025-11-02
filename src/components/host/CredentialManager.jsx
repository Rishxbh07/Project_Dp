import React from 'react';
import IssueResolver from './IssueResolver';
import IndividualCredentialSender from './IndividualCredentialSender';

const CredentialManager = ({ requests, booking, onUpdate }) => {
    const latestRequest = requests && requests.length > 0 ? requests[0] : null;

    const issueToResolve = latestRequest?.user_acess_confirmation_status === 'issue_reported'
        ? latestRequest
        : null;

    // --- THIS IS THE FIX ---
    // We check for the host's custom fields on the listing first.
    // If it's not there, we use the default fields from the service.
    const fieldsConfig = booking.listings?.required_fields || booking.listings?.services?.required_fields || [];

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Credential Manager</h3>
            {
                issueToResolve ? (
                    <IssueResolver 
                        reportedIssue={issueToResolve}
                        booking={booking}
                        onResolved={onUpdate}
                    />
                ) : (
                    <IndividualCredentialSender
                        requestId={latestRequest?.id}
                        onSent={onUpdate}
                        fieldsConfig={fieldsConfig} // Pass the correctly found config
                        sharingMethod={booking.listings?.services?.sharing_method}
                        serviceId={booking.listings?.services?.id}
                        isResend={latestRequest?.request_status === 'details_sent'}
                    />
                )
            }
        </div>
    );
};

export default CredentialManager;