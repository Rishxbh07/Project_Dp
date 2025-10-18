import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Share2, Users, Loader2, X } from 'lucide-react';
import Modal from './Modal';
import FriendshipProfileCard from './FriendshipProfileCard';

const InviteFriend = ({ isOpen, onClose, serviceName, hostUsername }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sentInvites, setSentInvites] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            if (isOpen) {
                setLoading(true);
                setSentInvites([]);
                try {
                    const { data, error } = await supabase.rpc('get_all_friend_data');
                    if (error) throw error;
                    setFriends(data.friends || []);
                } catch (error) {
                    console.error("Error fetching friends:", error);
                    setFriends([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFriends();
    }, [isOpen]);

    const handleSendPlanInvite = (userId) => {
        console.log(`Simulating sending invite for service '${serviceName}' to user ${userId}`);
        setSentInvites(prev => [...prev, userId]);
    };
    
    const handleSocialShare = async () => {
        const inviteLink = window.location.href;
        const message = `Hey! Join my ${serviceName} group on DapBuddy, hosted by ${hostUsername}. Check it out: ${inviteLink}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: `Join my ${serviceName} group!`, text: message });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert("Copy this message and share with your friends:\n\n" + message);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* MOBILE: Bottom Sheet */}
            <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
                <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invite a Friend</h2>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                            Invite friends to join your <span className="font-semibold text-purple-600 dark:text-purple-400">{serviceName}</span> group
                        </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {/* Friends List Section */}
                        <div className="mb-6">
                            <h3 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500" />
                                Your Friends
                            </h3>
                            <div className="space-y-2.5">
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
                                    </div>
                                ) : friends.length > 0 ? (
                                    friends.map(friend => (
                                        <FriendshipProfileCard
                                            key={friend.id}
                                            user={friend}
                                            type={sentInvites.includes(friend.id) ? 'plan-invite-sent' : 'plan-invite'}
                                            onPlanInvite={handleSendPlanInvite}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 dark:text-slate-400">
                                            You don't have any friends on DapBuddy yet
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Share Section */}
                        <div className="pb-4">
                            <h3 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-blue-500" />
                                Share via other apps
                            </h3>
                            <button 
                                onClick={handleSocialShare}
                                className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold py-3.5 rounded-xl transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                Share Invite Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESKTOP: Centered Modal */}
            <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Invite a Friend</h2>
                                <p className="text-base text-gray-600 dark:text-slate-400">
                                    Invite friends to join your <span className="font-semibold text-purple-600 dark:text-purple-400">{serviceName}</span> group hosted by <span className="font-semibold">{hostUsername}</span>
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        {/* Friends List Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2.5">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                Your Friends
                            </h3>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex justify-center items-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                    </div>
                                ) : friends.length > 0 ? (
                                    friends.map(friend => (
                                        <FriendshipProfileCard
                                            key={friend.id}
                                            user={friend}
                                            type={sentInvites.includes(friend.id) ? 'plan-invite-sent' : 'plan-invite'}
                                            onPlanInvite={handleSendPlanInvite}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                                            <Users className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                                        </div>
                                        <p className="text-base text-gray-500 dark:text-slate-400">
                                            You don't have any friends on DapBuddy yet
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Share Section */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2.5">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                Share via other apps
                            </h3>
                            <button 
                                onClick={handleSocialShare}
                                className="w-full flex items-center justify-center gap-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Share2 className="w-5 h-5" />
                                Share Invite Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InviteFriend;