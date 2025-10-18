import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, UserPlus, UserCheck, X, CheckCircle, UserX, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const FriendshipProfileCard = ({ user, type, onAccept, onDecline, onRemove, onAdd, onInvite, onPlanInvite }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const renderActions = () => {
        switch (type) {
            case 'request':
                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onAccept(user.id)} 
                            className="p-2.5 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all hover:scale-110 group"
                            aria-label="Accept friend request"
                        >
                            <UserCheck className="w-5 h-5 text-green-500 group-hover:text-green-600 transition-colors" />
                        </button>
                        <button 
                            onClick={() => onDecline(user.id)} 
                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all hover:scale-110 group"
                            aria-label="Decline friend request"
                        >
                            <X className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                        </button>
                    </div>
                );
            
            case 'friend':
                return (
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="p-2.5 bg-gray-500/10 hover:bg-gray-500/20 rounded-xl transition-all hover:scale-110"
                            aria-label="Friend options"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 z-10 overflow-hidden backdrop-blur-sm">
                                <button
                                    onClick={() => {
                                        onRemove(user.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors"
                                >
                                    <UserX className="w-4 h-4" />
                                    <span>Remove Friend</span>
                                </button>
                            </div>
                        )}
                    </div>
                );
            
            case 'plan-invite':
                return (
                    <button 
                        onClick={() => onPlanInvite(user.id)} 
                        className="flex items-center gap-1.5 text-xs font-bold text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-xl transition-all hover:scale-105"
                    >
                        <Send className="w-4 h-4" /> Send Invite
                    </button>
                );
            
            case 'plan-invite-sent':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Invite Sent
                    </span>
                );

            case 'contact-is-friend':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Friend
                    </span>
                );
            
            case 'contact-on-dapbuddy':
                return (
                    <button 
                        onClick={() => onAdd(user.id)} 
                        className="flex items-center gap-1.5 text-xs font-bold text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-sm hover:shadow-md hover:shadow-purple-500/20"
                    >
                        <UserPlus className="w-4 h-4" /> Add Friend
                    </button>
                );
            
            case 'contact-request-sent':
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5" /> 
                        Pending
                    </span>
                );
            
            case 'contact-not-on-dapbuddy':
                return (
                    <button 
                        onClick={() => onInvite(user.username)} 
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-sm hover:shadow-md hover:shadow-blue-500/20"
                    >
                        Invite
                    </button>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl flex items-center gap-4 border border-gray-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]">
            <Link to={`/profile/${user.username}`} className="flex items-center gap-4 flex-grow min-w-0">
                {user.pfp_url ? (
                    <img 
                        src={user.pfp_url} 
                        alt={user.username} 
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-purple-400/30 transition-all flex-shrink-0" 
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/20 group-hover:ring-purple-400/30 transition-all flex-shrink-0 shadow-md">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                        {user.username}
                    </p>
                    {type === 'request' && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                            Wants to be friends
                        </p>
                    )}
                </div>
            </Link>
            <div className="flex-shrink-0">
                {renderActions()}
            </div>
        </div>
    );
};

export default FriendshipProfileCard;