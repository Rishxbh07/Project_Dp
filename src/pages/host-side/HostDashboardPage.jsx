import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';
import { ArrowLeft, Users, Settings, Bell, BarChart2 } from 'lucide-react';
import PlanStatsHeader from '../../components/hostdashboard/PlanStatsHeader';
import UserDetailCard from '../../components/hostdashboard/UserDetailCard';
import GroupBroadcast from '../../components/hostdashboard/GroupBroadcast';
import EarningsSummary from '../../components/hostdashboard/EarningsSummary';
import DeleteListing from '../../components/hostdashboard/DeleteListing';

// We accept 'session' as a prop
const HostDashboardPage = ({ session }) => {
    const { listingId } = useParams();
    const [listing, setListing] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchListingData = useCallback(async () => {
        if (!listingId) return;
        setLoading(true);
        setError('');

        const { data: listingData, error: listingError } = await supabase
            .from('listings')
            .select(`
                *,
                services(*)
            `)
            .eq('id', listingId)
            .single();

        if (listingError) {
            setError('Failed to fetch listing details.');
            console.error(listingError);
            setLoading(false);
            return;
        }
        setListing(listingData);

        // --- THIS IS THE FIX ---
        // Changed the .in() query to a .eq('status', 'active')
        // This avoids the "pending_host_invite" enum error.
        const { data: membersData, error: membersError } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles(*)
            `)
            .eq('listing_id', listingId)
            .eq('status', 'active'); // Only fetch active members

        if (membersError) {
            setError('Failed to fetch members.');
            console.error('Error fetching members:', membersError);
        } else {
            setMembers(membersData);
        }
        setLoading(false);
    }, [listingId]);

    useEffect(() => {
        fetchListingData();
    }, [fetchListingData]);
    
    if (loading || !session?.user) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!listing) return <p className="text-center mt-8">Listing not found.</p>;

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
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
                    <PlanStatsHeader listing={listing} memberCount={members.length} />
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Members ({members.length})</h2>
                        <div className="space-y-3">
                            {members.map(member => (
                                // We pass the 'session' and the *full* listing object
                                <UserDetailCard 
                                    key={member.id} 
                                    member={member} 
                                    listing={listing}
                                    session={session} 
                                />
                            ))}
                        </div>
                    </div>

                    <GroupBroadcast listingId={listingId} />
                </div>

                <div className="md:col-span-1 space-y-6">
                    <EarningsSummary listingId={listingId} />
                    <DeleteListing listingId={listingId} />
                </div>
            </main>
        </div>
    );
};

export default HostDashboardPage;