import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle, Clock, Heart } from 'lucide-react';

const UserDetailCard = ({ member }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { profiles: user } = member;
    
    // Example data
    const loyaltyRating = 4.8; 
    const isFriend = true;

    return (
        <div className="bg-white dark:bg-slate-900/70 p-4 rounded-xl border border-gray-200 dark:border-white/10 transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                {/* PFP FALLBACK LOGIC */}
                {user.pfp_url ? (
                    <img src={user.pfp_url} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{user.username}</h4>
                        {isFriend && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold">Friend</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400"/> {loyaltyRating}</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400"/> Paid</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-sky-400"/> Details Pending</span>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 text-sm space-y-3 animate-in fade-in duration-500">
                    <div className="flex justify-between"><span className="text-slate-500">Joined:</span> <strong className="text-gray-800 dark:text-white">{new Date(member.joined_at).toLocaleDateString()}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Billing:</span> <strong className="text-gray-800 dark:text-white">Monthly</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Next Payout:</span> <strong className="text-gray-800 dark:text-white">Oct 28, 2025</strong></div>
                    <Link to={`/manage-member/${member.id}`} className="block text-right font-bold text-purple-500 dark:text-purple-400 hover:underline mt-2">
                        Manage Member &rarr;
                    </Link>
                </div>
            )}
        </div>
    );
};

const BuddiesList = ({ members }) => {
    return (
        <section className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10">
             <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Buddies ({members.length})</h3>
             <div className="space-y-3">
                {members.length > 0 ? members.map(member => (
                    <UserDetailCard key={member.id} member={member} />
                )) : (
                    <p className="text-center text-gray-500 dark:text-slate-400 py-4">No buddies have joined this group yet.</p>
                )}
             </div>
        </section>
    );
};

export { BuddiesList, UserDetailCard };