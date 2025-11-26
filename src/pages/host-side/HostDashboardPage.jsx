import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';
import { ArrowLeft } from 'lucide-react';
import PlanStatsHeader from '../../components/hostdashboard/PlanStatsHeader';
import UserDetailCard from '../../components/hostdashboard/UserDetailCard';
import EarningsSummary from '../../components/hostdashboard/EarningsSummary';
import DeleteListing from '../../components/hostdashboard/DeleteListing';
import Modal from '../../components/common/Modal'; // Ensure you have this component

const HostDashboardPage = ({ session }) => {
    const { listingId } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Archive Modal State
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [archiveReason, setArchiveReason] = useState('');
    const [isArchiving, setIsArchiving] = useState(false);

    const fetchListingData = useCallback(async () => {
        if (!listingId) return;
        setLoading(true);
        setError('');

        // Fetch Listing
        const { data: listingData, error: listingError } = await supabase
            .from('listings')
            .select(`*, services(*)`)
            .eq('id', listingId)
            .single();

        if (listingError) {
            setError('Failed to fetch listing details.');
            setLoading(false);
            return;
        }
        setListing(listingData);

        // Fetch Active Members
        const { data: membersData, error: membersError } = await supabase
            .from('bookings')
            .select(`*, profiles(*)`)
            .eq('listing_id', listingId)
            .eq('status', 'active');

        if (membersError) {
            console.error('Error fetching members:', membersError);
        } else {
            setMembers(membersData);
        }
        setLoading(false);
    }, [listingId]);

    useEffect(() => {
        fetchListingData();
    }, [fetchListingData]);

    // --- SHARE FUNCTIONALITY ---
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/join-plan/${listingId}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join my ${listing?.services?.name || 'DapBuddy'} group!`,
                    text: 'Save money by splitting the subscription cost with me on DapBuddy.',
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Group link copied to clipboard!');
        }
    };

    // --- ARCHIVE FUNCTIONALITY ---
    const handleArchive = async () => {
        if (!archiveReason.trim()) return alert("Please provide a reason for archiving.");
        
        setIsArchiving(true);
        try {
            const { error } = await supabase
                .from('listings')
                .update({ 
                    status: 'archived', 
                    archive_reason: archiveReason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', listingId);

            if (error) throw error;

            // Success: Navigate away or refresh
            alert('Listing archived successfully.');
            navigate('/host-plan'); // Redirect to host hub or appropriate page
        } catch (err) {
            console.error('Error archiving:', err);
            alert('Failed to archive listing. Please try again.');
            setIsArchiving(false);
        }
    };

    if (loading || !session?.user) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!listing) return <p className="text-center mt-8">Listing not found.</p>;

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
            <header className="sticky top-0 z-20 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/host/dashboard" className="text-purple-500 dark:text-purple-400">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                        {listing.services.name} Group
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Pass handleShare to the header */}
                    <PlanStatsHeader 
                        listing={listing} 
                        memberCount={members.length} 
                        onShare={handleShare} 
                    />
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Members ({members.length})</h2>
                        <div className="space-y-3">
                            {members.length > 0 ? (
                                members.map(member => (
                                    <UserDetailCard 
                                        key={member.id} 
                                        member={member} 
                                        listing={listing}
                                        session={session} 
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-slate-400 text-sm">No active members yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 space-y-6">
                    <EarningsSummary 
                        basePrice={listing.services.base_price}
                        memberCount={members.length}
                        platformFee={listing.services.platform_commission_rate}
                    />
                    
                    {/* Pass correct props for Archiving */}
                    <DeleteListing 
                        isActiveMembers={members.length > 0} 
                        onDelete={() => setShowArchiveModal(true)} 
                    />
                </div>
            </main>

            {/* --- ARCHIVE CONFIRMATION MODAL --- */}
            <Modal isOpen={showArchiveModal} onClose={() => setShowArchiveModal(false)}>
                <div className="p-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Archive Listing?</h3>
                    <p className="text-gray-500 dark:text-slate-300 mb-4 text-sm">
                        Since there are no active members, you can archive this listing. It will no longer be visible to new users.
                    </p>
                    
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                        Reason for archiving
                    </label>
                    <textarea
                        value={archiveReason}
                        onChange={(e) => setArchiveReason(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none mb-6"
                        rows={3}
                        placeholder="e.g., Not using this service anymore..."
                    />

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowArchiveModal(false)}
                            disabled={isArchiving}
                            className="flex-1 py-3 font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleArchive}
                            disabled={isArchiving}
                            className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 transition-all"
                        >
                            {isArchiving ? 'Archiving...' : 'Confirm Archive'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default HostDashboardPage;