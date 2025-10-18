import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Star, IndianRupee, Trash2, AlertTriangle, Clock, CheckCircle, ChevronRight, UserPlus, Users, Tag, Lock, ShoppingCart } from 'lucide-react';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import InviteFriend from '../components/common/InviteFriend';

const SimpleMemberCard = ({ booking }) => {
    const userProfile = booking.profiles;
    const inviteData = (booking.invite_link && booking.invite_link.length > 0) ? booking.invite_link[0] : null;
    const status = inviteData?.status || 'pending_host_invite';
    const paymentStatus = booking.payment_status;

    const getStatusBadge = () => {
        switch (status) {
            case 'pending_host_invite':
                return <span className="flex items-center gap-1 text-xs font-semibold text-gray-500"><Clock className="w-3 h-3"/> Send Invite</span>;
            case 'pending_host_confirmation':
                return <span className="flex items-center gap-1 text-xs font-semibold text-blue-500"><AlertTriangle className="w-3 h-3"/> Action Required</span>;
            case 'active':
                return <span className="flex items-center gap-1 text-xs font-semibold text-green-500"><CheckCircle className="w-3 h-3"/> Active</span>;
            case 'pending_user_reveal':
                 return <span className="flex items-center gap-1 text-xs font-semibold text-gray-500"><Clock className="w-3 h-3"/> Awaiting User</span>;
            default:
                if (status.startsWith('mismatch')) {
                    return <span className="flex items-center gap-1 text-xs font-semibold text-yellow-500"><AlertTriangle className="w-3 h-3"/> Mismatch</span>;
                }
                return null;
        }
    };

    if (!userProfile) return null;

    return (
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-4">
                {userProfile.pfp_url ? (
                    <img src={userProfile.pfp_url} alt={userProfile.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">{userProfile.username.charAt(0).toUpperCase()}</div>
                )}
                <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{userProfile.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge()}
                        {paymentStatus && (
                            <span className={`capitalize text-xs font-semibold px-2 py-0.5 rounded-full ${
                                paymentStatus.toLowerCase().includes('paid')
                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                            }`}>
                                {paymentStatus}
                            </span>
                        )}
                    </div>
                </div>
                <Link to={`/hosted-plan/member/${booking.id}`} className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 p-2 rounded-full text-gray-600 dark:text-slate-300 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
};


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
            .select(`*, services(*), profiles(*), bookings(*, profiles(*), invite_link(status), payment_status)`)
            .eq('id', id)
            .order('joined_at', { foreignTable: 'bookings', ascending: true })
            .single();

        if (error) {
            setError('Could not load the plan details.');
            console.error(error);
        } else {
            setListing(data);
            const active = (data.bookings || []).filter(m => m.status === 'active');
            setActiveMembers(active);
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
        // ... (rest of the function is the same)
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error || !listing) return <p className="text-center text-red-500 mt-8">{error || 'Listing not found.'}</p>;
    
    const { services: service, profiles: host } = listing;
    
    if (!service || !host) {
        return <p className="text-center text-red-500 mt-8">Essential plan data is missing.</p>;
    }

    const soldSeats = activeMembers.length;
    const totalCapacity = listing.seats_total;
    const originallyOffered = listing.seats_originally_offered || 0;
    const reservedByHost = totalCapacity - originallyOffered;

    const potentialEarning = (service.base_price * soldSeats).toFixed(2);
    const platformCut = (potentialEarning * (service.platform_commission_rate / 100)).toFixed(2);
    const finalPayout = (potentialEarning - platformCut).toFixed(2);
    const averageRating = listing.rating_count > 0 ? (listing.total_rating / listing.rating_count) : 0;

    return (
        <>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                        <Link to="/subscription" className="text-purple-500 dark:text-purple-400 text-sm">&larr; Back</Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h1>
                        <div className="w-16"></div>
                    </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 md:gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-1">
                        <section className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">{service.name.charAt(0)}</div>
                            <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                                <div className="bg-white dark:bg-white/5 p-2 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">Your Host Rating</p><p className="font-bold text-lg text-yellow-500 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {host.host_rating.toFixed(1)}</p></div>
                                <div className="bg-white dark:bg-white/5 p-2 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">This Plan's Rating</p><p className="font-bold text-lg text-blue-500 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {averageRating.toFixed(1)}</p></div>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 mb-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-green-500" /> Earning Breakdown</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Potential Earning</span><span className="font-semibold text-gray-800 dark:text-slate-200">₹{potentialEarning}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Platform charges ({service.platform_commission_rate}%)</span><span className="font-semibold text-red-500">- ₹{platformCut}</span></div>
                                <div className="border-t border-gray-200 dark:border-white/10 my-1"></div>
                                <div className="flex justify-between"><span className="text-gray-600 dark:text-slate-300 font-bold">Final Payout</span><span className="font-bold text-green-600 dark:text-green-400">₹{finalPayout}</span></div>
                            </div>
                        </section>
                        <section>
                            <button onClick={() => setIsInviteModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 font-semibold py-3 rounded-xl transition-colors mb-4">
                                <UserPlus className="w-5 h-5" /> Invite a Friend
                            </button>
                            <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-semibold py-3 rounded-xl transition-colors">
                                <Trash2 className="w-5 h-5" /> Delete Listing
                            </button>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-1 mt-8 md:mt-0 space-y-6">
                        <section className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reserved by You ({reservedByHost})</h3>
                                <button 
                                    onClick={() => alert('Coming Soon! This feature will allow you to add members who are not on DapBuddy.')}
                                    className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-semibold py-2 px-3 rounded-lg hover:bg-blue-500/20 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4"/> Add Member
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400">These are the spots you've kept for yourself or friends outside DapBuddy.</p>
                        </section>
                        
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Plan Overview</h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg text-center"><p className="text-xs text-gray-500 dark:text-slate-400">Total Capacity</p><p className="font-bold text-lg flex items-center justify-center gap-1"><Users className="w-4 h-4"/> {totalCapacity} Seats</p></div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center"><p className="text-xs text-gray-500 dark:text-slate-400">Offered for Sale</p><p className="font-bold text-lg flex items-center justify-center gap-1"><Tag className="w-4 h-4 text-green-500"/> {originallyOffered} Seats</p></div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center"><p className="text-xs text-gray-500 dark:text-slate-400">Reserved by Host</p><p className="font-bold text-lg flex items-center justify-center gap-1"><Lock className="w-4 h-4 text-blue-500"/> {reservedByHost} Seats</p></div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center"><p className="text-xs text-gray-500 dark:text-slate-400">Sold on DapBuddy</p><p className="font-bold text-lg flex items-center justify-center gap-1"><ShoppingCart className="w-4 h-4 text-purple-500"/> {soldSeats} Seats</p></div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">DapBuddy Members ({soldSeats})</h3>
                            {activeMembers.length > 0 ? (
                                <div className="space-y-4">
                                    {activeMembers.map((booking) => (
                                        <SimpleMemberCard key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-slate-400 p-8 bg-white dark:bg-white/5 rounded-2xl border border-dashed dark:border-white/10">No one has joined your plan yet.</p>
                            )}
                        </section>
                    </div>
                </main>
            </div>
            
            <InviteFriend
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                serviceName={service.name}
                hostUsername={host.username}
            />

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                {/* Modal content remains the same */}
            </Modal>
        </>
    );
};

export default HostedPlanDetailPage;