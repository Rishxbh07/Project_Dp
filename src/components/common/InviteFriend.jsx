import React from 'react';
import Modal from './Modal';
import { Share2, Copy, MessageSquare, Twitter } from 'lucide-react';

const InviteFriend = ({ isOpen, onClose, serviceName, hostUsername }) => {
  const inviteLink = window.location.href; // This is a placeholder. In a real app, you'd generate a unique link.
  const inviteMessage = `Hey! ${hostUsername} wants you to join their ${serviceName} group on DapBuddy. Follow this link to join. Happy savings!!!`;

  const handleShare = async (platform) => {
    const text = encodeURIComponent(inviteMessage);
    const url = encodeURIComponent(inviteLink);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Link copied to clipboard!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invite a Friend</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6">Share this group with your friends.</p>

        {/* Friends List Placeholder */}
        <div className="text-center text-gray-400 dark:text-slate-500 my-8">
          <p>(Friend list will be displayed here in the future)</p>
        </div>


        <div className="space-y-4">
            <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5" />
                Copy Link
              </button>
          <div className="flex gap-4">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" /> WhatsApp
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex-1 bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Twitter className="w-5 h-5" /> Twitter
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InviteFriend;