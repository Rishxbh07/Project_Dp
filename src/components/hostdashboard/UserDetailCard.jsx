// src/components/hostdashboard/UserDetailCard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MessageSquare } from 'lucide-react';
import Modal from '../common/Modal'; // Import Modal
import CommunicationManager from '../subscriptiondashboard/CommunicationManager'; // Import our chat component

const UserDetailCard = ({ member, listing, session }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    // 'member' is the booking object
    const booking = member;
    // 'hostUser' is the logged-in user from the session
    const hostUser = session.user;
    // 'userProfile' is the profile of the user in this card
    const userProfile = member.profiles;

    if (!userProfile) return null; // Safety check

    const avatarUrl = userProfile.pfp_url || `https://api.dicebear.com/8.x/initials/svg?seed=${userProfile.username || '?'}`;

    const handleChatClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsChatOpen(true);
    };
    
    return (
        <>
            <Link 
                to={`/host/member/${booking.id}`} 
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
                {/* User Info (Left Side) */}
                <div className="flex items-center gap-3">
                    <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{userProfile.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.status === 'active' ? (
                                <span className="text-green-500">Active</span>
                            ) : (
                                <span className="text-yellow-500">{booking.status}</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Buttons (Right Side) */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleChatClick}
                        className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-600"
                        title="Chat with user"
                    >
                        <MessageSquare size={20} />
                    </button>
                    <ChevronRight className="text-gray-400" size={20} />
                </div>
            </Link>

            {/* --- NEW CHAT MODAL --- */}
            <Modal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                title={`Communicating with ${userProfile.username}`}
            >
                {/* --- THIS IS THE FIX ---
                  We now pass 'booking' and 'listing' as separate, stable props.
                  This stops the infinite re-render loop.
                */}
                <CommunicationManager 
                    booking={booking} 
                    listing={listing}
                    user={hostUser} 
                />
            </Modal>
        </>
    );
};

export default UserDetailCard;