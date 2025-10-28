import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, AlertTriangle, LogOut } from 'lucide-react';

const ActionButtons = ({ bookingId, listingId, username, serviceName, onLeaveClick }) => {
    const shareMessage = `Heyy !!! ${username} wants you to join their ${serviceName} group and start saving now!!`;
    const shareUrl = `${window.location.origin}/join-plan/${listingId}`;

    const handleShare = async () => {
        if (navigator.share) {
            navigator.share({ title: `Join this ${serviceName} group!`, text: shareMessage, url: shareUrl });
        } else {
            navigator.clipboard.writeText(`${shareMessage} ${shareUrl}`);
            alert('Invite link copied to clipboard!');
        }
    };

    return (
        <section className="space-y-3">
            <button onClick={handleShare} className="w-full text-left flex items-center p-4 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <Share2 className="w-5 h-5 mr-4 text-blue-500" />
                <span className="flex-1 font-semibold text-gray-800 dark:text-slate-200">Share This Plan</span>
            </button>
            <Link to={`/dispute/${bookingId}`} className="w-full text-left flex items-center p-4 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-colors">
                <AlertTriangle className="w-5 h-5 mr-4 text-yellow-600 dark:text-yellow-400" />
                <span className="flex-1 font-semibold text-yellow-700 dark:text-yellow-300">Report an Issue</span>
            </Link>
            <button onClick={onLeaveClick} className="w-full text-left bg-red-500/10 flex items-center p-4 rounded-lg hover:bg-red-500/20 transition-colors">
                <LogOut className="w-5 h-5 mr-4 text-red-500 dark:text-red-400" />
                <span className="font-semibold text-red-500 dark:text-red-400">Leave Plan</span>
            </button>
        </section>
    );
};

export default ActionButtons;