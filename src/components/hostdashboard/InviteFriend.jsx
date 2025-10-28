import React from 'react';
import { UserPlus } from 'lucide-react';

const InviteFriend = ({ hostUsername, serviceName }) => {
    const inviteMessage = `😎 hey !! ${hostUsername} wants you to join his ${serviceName} plan and start saving now 😊😊 log in on dapbuddy or create a account to start saving now🫡⭐🫱🏻‍🫲🏻`;
    
    const handleInvite = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join ${hostUsername}'s ${serviceName} Plan!`,
                    text: inviteMessage,
                    url: window.location.origin,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback for desktop: copy to clipboard
            navigator.clipboard.writeText(inviteMessage);
            alert('Invite message copied to clipboard!');
        }
    };

    return (
        <button onClick={handleInvite} className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700">
            <UserPlus className="w-4 h-4" /> Invite a Friend
        </button>
    );
};

export default InviteFriend;