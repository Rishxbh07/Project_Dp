// src/pages/HostedPlanDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Star, IndianRupee, Trash2, AlertTriangle, Info, UserPlus } from 'lucide-react';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import InviteFriend from '../components/common/InviteFriend';

import MemberStatusCard from '../components/host/MemberStatusCard';
import BroadcastDetailsInput from '../components/host/BroadcastDetailsInput';

const HostedPlanDetailPage = ({ session }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [activeMembers, setActiveMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const deletionReasons = [
        "The subscription plan has expired.",
        "I no longer use this service.",
        "I want to change the price or slots.",
        "Other"
    ];

    const fetchListingDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                services(*),
                profiles(*),
                bookings (
                    *,
                    profiles(*)
                )
            `)
            .eq('id', id)
            .eq('bookings.status', 'active')
            .single();

        if (error) {
            setError('Could not load the plan details.');
            console.error(error);
        } else {
            setListing(data);
            setActiveMembers(data.bookings || []);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchListingDetails();
    }, [fetchListingDetails]);
    
    const handleArchiveListing = async () => {
        if (!deleteReason) {
            alert('Please select a reason for deleting the listing.');
            return;
        }
        setIsDeleting(true);
        const { error } = await supabase
            .from('listings')
            .update({ status: 'archived', archive_reason: deleteReason })
            .eq('id', id);

        if (error) {
            alert('Failed to delete listing: ' + error.message);
        } else {
            alert('Listing successfully deleted.');
            navigate('/subscription');
        }
        setIsDeleting(false);
        setShowDeleteModal(false);
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error || !listing) return <p className="text-center text-red-500 mt-8">{error || 'Listing not found.'}</p>;
    
    const { services: service, profiles: host } = listing;
    
    if (!service || !host) {
        return <p className="text-center text-red-500 mt-8">Essential plan data is missing.</p>;
    }

    const soldSeats = activeMembers.length;
    const potentialEarning = (service.base_price * soldSeats).toFixed(2);
    const platformCut = (potentialEarning * (service.platform_commission_rate / 100)).toFixed(2);
    const finalPayout = (potentialEarning - platformCut).toFixed(2);
    const averageRating = listing.rating_count > 0 ? (listing.total_rating / listing.rating_count) : 0;

    return (
        <>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link to="/subscription" className="text-purple-500 dark:text-purple-400 text-sm">&larr; Back</Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h1>
                        <div className="w-16"></div>
                    </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-2 md:gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <section className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">{service.name.charAt(0)}</div>
                            <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                                <div className="bg-white dark:bg-white/5 p-2 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">Your Host Rating</p><p className="font-bold text-lg text-yellow-500 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {host.host_rating.toFixed(1)}</p></div>
                                <div className="bg-white dark:bg-white/5 p-2 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">This Plan's Rating</p><p className="font-bold text-lg text-blue-500 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {averageRating.toFixed(1)}</p></div>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-green-500" /> Earning Breakdown</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Potential Earning</span><span className="font-semibold text-gray-800 dark:text-slate-200">₹{potentialEarning}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Platform charges ({service.platform_commission_rate}%)</span><span className="font-semibold text-red-500">- ₹{platformCut}</span></div>
                                <div className="border-t border-gray-200 dark:border-white/10 my-1"></div>
                                <div className="flex justify-between"><span className="text-gray-600 dark:text-slate-300 font-bold">Final Payout</span><span className="font-bold text-green-600 dark:text-green-400">₹{finalPayout}</span></div>
                            </div>
                        </section>
                         <section>
                             <BroadcastDetailsInput
                                serviceId={listing.service_id}
                                listingId={listing.id}
                            />
                        </section>
                    </div>
                    <div className="md:col-span-1 mt-8 md:mt-0 space-y-6">
                        <section>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                Buddies ({soldSeats})
                                <span title="Members who joined from the DapBuddy platform">
                                    <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                                </span>
                            </h3>
                            {activeMembers.length > 0 ? (
                                <div className="space-y-4">
                                    {activeMembers.map((booking) => (
                                        <Link to={`/hosted-plan/member/${booking.id}`} key={booking.id} className="block hover:bg-gray-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                            <MemberStatusCard booking={booking} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-slate-400 p-8 bg-white dark:bg-white/5 rounded-2xl border border-dashed dark:border-white/10">No one has joined your plan yet.</p>
                            )}
                        </section>
                        <section className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-700 md:border-none">
                             <button onClick={() => setIsInviteModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 font-semibold py-3 rounded-xl transition-colors">
                                 <UserPlus className="w-5 h-5" /> Invite a Friend
                             </button>
                             <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-semibold py-3 rounded-xl transition-colors">
                                 <Trash2 className="w-5 h-5" /> Delete Listing
                             </button>
                        </section>
                    </div>
                </main>
                <div className="h-24"></div>
            </div>
            
            <InviteFriend
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                serviceName={service.name}
                hostUsername={host.username}
            />

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                 <div className="p-2">
                    <div className="text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                        <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">Delete Group Listing</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                            Are you sure you want to delete this group? All active subscriptions will be cancelled. This action cannot be undone.
                        </p>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Reason for deletion</label>
                        <select
                            id="deleteReason"
                            name="deleteReason"
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">Select a reason...</option>
                            {deletionReasons.map(reason => (
                                <option key={reason} value={reason}>{reason}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleArchiveListing}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default HostedPlanDetailPage;