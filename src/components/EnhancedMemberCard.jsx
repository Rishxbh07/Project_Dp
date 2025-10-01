import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ChevronDown, ChevronUp, Clock, CheckCircle, AlertTriangle, IndianRupee, Repeat, Calendar, XCircle, UserCheck } from 'lucide-react';
import UserDetails from './common/UserDetails';
import SendPlanLink from './common/SendPlanLink';
import Loader from './common/Loader';

const EnhancedMemberCard = ({ booking, listing, service, onInviteUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const userProfile = booking.profiles;
    
    const inviteLinkData = (booking.invite_link && booking.invite_link.length > 0) ? booking.invite_link[0] : null;
    const bookingState = inviteLinkData?.status || 'pending_host_invite';

    const handleAction = async (newStatus) => {
        if (!inviteLinkData) return;
        setIsUpdating(true);
        
        let updatePayload = { status: newStatus };
        if (newStatus === 'active') {
            updatePayload.host_identity_confirmed_at = new Date().toISOString();
        } else if (newStatus.startsWith('mismatch')) {
            updatePayload.host_mismatch_reported_at = new Date().toISOString();
        }

        const { data: updatedInvite, error } = await supabase
            .from('invite_link')
            .update(updatePayload)
            .eq('booking_id', booking.id)
            .select()
            .single();
        
        if (error) {
            alert(`Failed to update status: ${error.message}`);
        } else {
            onInviteUpdate(booking.id, updatedInvite);
        }
        setIsUpdating(false);
    };

    const handleSendSuccess = (newInviteData) => {
        onInviteUpdate(booking.id, newInviteData);
    };
    
    const joinDate = new Date(booking.joined_at);
    const renewalDate = new Date(new Date(booking.joined_at).setMonth(new Date(booking.joined_at).getMonth() + 1));
    const payoutDate = new Date(new Date(booking.joined_at).setDate(new Date(booking.joined_at).getDate() + 31));
    const billingChoice = (booking.transactions && booking.transactions.length > 0) 
        ? (booking.transactions[0].billing_options === 'oneTime' ? 'One-Time' : 'AutoPay') 
        : 'AutoPay';

    if (!userProfile) return null;

    return (
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                {userProfile.pfp_url ? (
                    <img src={userProfile.pfp_url} alt={userProfile.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">{userProfile.username.charAt(0).toUpperCase()}</div>
                )}
                <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{userProfile.username}</p>
                    <div className="flex items-center gap-2 text-xs mt-1">
                        {bookingState === 'active' && <span className="flex items-center gap-1 font-semibold text-green-500"><CheckCircle className="w-3 h-3"/> Active</span>}
                        {bookingState === 'pending_host_confirmation' && <span className="flex items-center gap-1 font-semibold text-blue-500"><AlertTriangle className="w-3 h-3"/> Action Required</span>}
                        {bookingState === 'pending_host_invite' && <span className="flex items-center gap-1 font-semibold text-gray-500"><Clock className="w-3 h-3"/> Send Invite</span>}
                        {bookingState === 'pending_user_reveal' && <span className="flex items-center gap-1 font-semibold text-gray-500"><Clock className="w-3 h-3"/> Awaiting User</span>}
                        {(bookingState === 'mismatch_reported_once' || bookingState === 'mismatch_reported_twice') && <span className="flex items-center gap-1 font-semibold text-yellow-500"><XCircle className="w-3 h-3"/> Mismatch Reported</span>}
                    </div>
                </div>
                <button className="text-gray-400 dark:text-slate-500">{isExpanded ? <ChevronUp /> : <ChevronDown />}</button>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-4 animate-in fade-in">
                    {isUpdating && <Loader />}

                    {bookingState === 'pending_host_invite' ? (
                        <SendPlanLink booking={booking} listing={listing} service={service} inviteData={inviteLinkData} onSuccess={handleSendSuccess} />
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600 dark:text-slate-300 mb-2">User's Connected Account Details</h4>
                                <UserDetails booking={booking} />
                            </div>

                             <div>
                                <h4 className="font-semibold text-sm text-gray-600 dark:text-slate-300 mb-2">Member Information</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-gray-100 dark:bg-slate-800 p-2 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">Joined On</p><p className="font-semibold">{joinDate.toLocaleDateString()}</p></div>
                                    <div className="bg-gray-100 dark:bg-slate-800 p-2 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">Billing</p><p className="font-semibold">{billingChoice}</p></div>
                                    <div className="bg-gray-100 dark:bg-slate-800 p-2 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">Next Renewal</p><p className="font-semibold">{renewalDate.toLocaleDateString()}</p></div>
                                    <div className="bg-green-500/10 text-green-700 dark:text-green-300 p-2 rounded-lg"><p className="text-xs">Your Payout Date</p><p className="font-bold">{payoutDate.toLocaleDateString()}</p></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                                <h4 className="font-semibold text-sm text-gray-600 dark:text-slate-300 mb-2">Host Actions</h4>
                                
                                {bookingState === 'pending_user_reveal' && (
                                    <div className="text-center p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300">
                                        Waiting for user to reveal details. You will be notified.
                                    </div>
                                )}

                                {(bookingState === 'pending_host_confirmation' || bookingState.startsWith('mismatch')) && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAction(bookingState === 'mismatch_reported_once' ? 'mismatch_reported_twice' : 'mismatch_reported_once')} disabled={isUpdating} className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-semibold py-2 rounded-lg hover:bg-red-500/20 disabled:opacity-50">
                                            <XCircle className="w-4 h-4" /> Mismatch
                                        </button>
                                        <button onClick={() => handleAction('active')} disabled={isUpdating} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                                            <UserCheck className="w-4 h-4" /> Confirm
                                        </button>
                                    </div>
                                )}

                                {bookingState === 'active' && (
                                    <div className="text-center p-3 bg-green-500/10 rounded-lg text-sm font-semibold text-green-600 dark:text-green-300">
                                        User is confirmed and active.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EnhancedMemberCard;