import React from 'react';
import { User, Layers } from 'lucide-react';

const MemberInfoCard = ({ profile, listing }) => {
    // Correct fallback logic for the avatar
    const avatarUrl = profile.pfp_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username || '?'}`;
    
    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full border-2 border-purple-500"
                />
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{profile.username}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member</p>
                </div>
            </div>
            <div className="border-t dark:border-slate-700 my-4"></div>
            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                    <Layers className="text-purple-500" size={18} />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{listing.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <User className="text-purple-500" size={18} />
                     <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                        <p className="font-mono text-xs text-gray-600 dark:text-gray-400">{profile.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberInfoCard;