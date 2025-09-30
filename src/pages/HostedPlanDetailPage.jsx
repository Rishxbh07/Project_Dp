import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Star, User, ChevronDown, ChevronUp, CheckCircle, XCircle, IndianRupee, ShieldCheck, Trash2, AlertTriangle, Send, MessageSquare } from 'lucide-react';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

// --- Helper function for domain validation ---
const isValidDomain = (url, serviceName) => {
    try {
        const hostname = new URL(url).hostname;
        const lowerCaseServiceName = serviceName.toLowerCase();
        
        if (lowerCaseServiceName.includes('spotify')) {
            return hostname.endsWith('spotify.com');
        }
        if (lowerCaseServiceName.includes('youtube')) {
            return hostname.endsWith('youtube.com') || hostname.endsWith('youtu.be');
        }
        if (lowerCaseServiceName.includes('netflix')) {
            return hostname.endsWith('netflix.com');
        }
        // Add more services as needed...
        return true; // Default to true if no specific rule is set
    } catch (e) {
        return false;
    }
};


const MemberCard = ({ booking, sharingMethod, serviceName }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [address, setAddress] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [sendSuccess, setSendSuccess] = useState(false);

    const connectedAccount = booking.connected_accounts && booking.connected_accounts[0];
    const userProfile = booking.profiles;

    if (!userProfile) {
        return null;
    }

    const handleSendDetails = async () => {
        setError('');
        setSendSuccess(false);

        if (!isValidDomain(inviteLink, serviceName)) {
            setError(`Please enter a valid invite link for ${serviceName}.`);
            return;
        }

        const forbiddenPattern = /(call|contact|message|msg|whatsapp|telegram|phone|email|gmail|outlook|@|\.com|\.in|\d{7,})/i;
        if (forbiddenPattern.test(address)) {
            setError('Address field cannot contain contact information.');
            return;
        }

        setIsSending(true);
        const notificationMessage = `Your host for the ${serviceName} plan has sent the joining details.\nInvite Link: ${inviteLink}\nAddress: ${address}`;
        
        const { error: insertError } = await supabase
            .from('notifications')
            .insert({ user_id: booking.buyer_id, message: notificationMessage });

        if (insertError) {
            setError('Failed to send details. Please try again.');
        } else {
            setSendSuccess(true);
        }
        setIsSending(false);
    };

    const isConfirmed = connectedAccount?.account_confirmation === 'confirmed';
    const confirmationStyles = isConfirmed ? 'text-green-500' : 'text-yellow-500';

    return (
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                {userProfile.pfp_url ? (
                    <img src={userProfile.pfp_url} alt={userProfile.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                        {userProfile.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{userProfile.username}</p>
                    <div className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
                        <User className="w-3 h-3" />
                        <span>Loyalty: {userProfile.loyalty_score || 0}</span>
                    </div>
                </div>
                <button className="text-gray-400 dark:text-slate-500">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-3 text-sm animate-in fade-in">
                    <h4 className="font-semibold text-gray-800 dark:text-white">Send Joining Details</h4>
                    
                    {sharingMethod === 'invite_link' ? (
                        <div className="space-y-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                            <input
                                type="url"
                                placeholder="Paste invite link here..."
                                value={inviteLink}
                                onChange={(e) => setInviteLink(e.target.value)}
                                className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <input
                                type="text"
                                placeholder="Enter required address..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full p-2 text-sm bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            {error && <p className="text-xs text-red-500">{error}</p>}
                            {sendSuccess && <p className="text-xs text-green-500">Details sent to user via notification!</p>}
                            <button
                                onClick={handleSendDetails}
                                disabled={isSending || sendSuccess}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                            >
                                <Send className="w-4 h-4" />
                                {isSending ? 'Sending...' : (sendSuccess ? 'Sent!' : 'Send')}
                            </button>
                        </div>
                    ) : (
                        <button className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            Send Details (Chat)
                        </button>
                    )}

                </div>
            )}
        </div>
    );
};


const HostedPlanDetailPage = ({ session }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const deletionReasons = [
        "The subscription plan has expired.",
        "I no longer use this service.",
        "I want to change the price or slots.",
        "Other"
    ];

    const handleArchiveListing = async () => {
        if (!deleteReason) {
            alert('Please select a reason for deleting the listing.');
            return;
        }
        setIsDeleting(true);
        const { error } = await supabase
            .from('listings')
            .update({
             status: 'archived',
            archive_reason: deleteReason 
        })
            .eq('id', id);

        if (error) {
            setError('Failed to archive listing. Please try again.');
            setIsDeleting(false);
            setShowDeleteModal(false);
        } else {
            navigate('/subscription');
        }
    };

    useEffect(() => {
        const fetchListingDetails = async () => {
            if (!id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('listings')
                .select(`*, services (*), profiles (*), bookings (*, buyer_id, joined_at, payment_status, profiles (*), connected_accounts (*))`)
                .eq('id', id)
                .single();

            if (error) {
                setError('Could not load the plan details.');
            } else {
                setListing(data);
            }
            setLoading(false);
        };
        fetchListingDetails();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error || !listing) return <p className="text-center text-red-500 mt-8">{error || 'Listing not found.'}</p>;
    
    const service = listing.services;
    const host = listing.profiles;
    const members = listing.bookings || [];
    
    if (!service || !host) {
        return <p className="text-center text-red-500 mt-8">Essential plan data is missing.</p>;
    }

    const seatsSold = members.length;
    const potentialEarning = (service.base_price * seatsSold).toFixed(2);
    const platformCut = (potentialEarning * (service.platform_commission_rate / 100)).toFixed(2);
    const finalPayout = (potentialEarning - platformCut).toFixed(2);
    const averageRating = listing.rating_count > 0 ? (listing.total_rating / listing.rating_count) : 0;

    return (
        <>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                        <Link to="/subscription" className="text-purple-500 dark:text-purple-400 text-sm">
                            &larr; Back
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h1>
                        <div className="w-16"></div>
                    </div>
                </header>

                <main className="max-w-md mx-auto px-4 py-6">
                    <section className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                            {service.name.charAt(0)}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white dark:bg-white/5 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-slate-400">Your Host Rating</p>
                                <p className="font-bold text-lg text-yellow-500 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {host.host_rating.toFixed(1)}</p>
                            </div>
                            <div className="bg-white dark:bg-white/5 p-2 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-slate-400">This Plan's Rating</p>
                                <p className="font-bold text-lg text-blue-500 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {averageRating.toFixed(1)}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 mb-8">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-green-500" /> Earning Breakdown</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">Potential Earning</span>
                                <span className="font-semibold text-gray-800 dark:text-slate-200">₹{potentialEarning}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">Platform charges ({service.platform_commission_rate}%)</span>
                                <span className="font-semibold text-red-500">- ₹{platformCut}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-white/10 my-1"></div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-slate-300 font-bold">Final Payout</span>
                                <span className="font-bold text-green-600 dark:text-green-400">₹{finalPayout}</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Plan Members ({members.length}/{listing.seats_total})</h2>
                        {members.length > 0 ? (
                            <div className="space-y-4">
                                {members.map((booking) => (
                                    <MemberCard 
                                        key={booking.id} 
                                        booking={booking} 
                                        sharingMethod={service.sharing_method}
                                        serviceName={service.name}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-slate-400 p-8 bg-white dark:bg-white/5 rounded-2xl border border-dashed dark:border-white/10">
                                No one has joined your plan yet.
                            </p>
                        )}
                    </section>
                    
                    <section className="mt-8">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-semibold py-3 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Listing
                        </button>
                    </section>
                    <div className="h-24"></div>
                </main>
            </div>

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                {/* ... (Modal content remains the same) ... */}
            </Modal>
        </>
    );
};

export default HostedPlanDetailPage;