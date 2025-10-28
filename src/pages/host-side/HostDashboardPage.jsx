import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft } from 'lucide-react';
import Loader from '../../components/common/Loader';
import PlanStatsHeader from '../../components/hostdashboard/PlanStatsHeader';
import EarningsSummary from '../../components/hostdashboard/EarningsSummary';
import { BuddiesList } from '../../components/hostdashboard/UserDetailCard';
import GroupBroadcast from '../../components/hostdashboard/GroupBroadcast';
import InviteFriend from '../../components/hostdashboard/InviteFriend';
import DeleteListing from '../../components/hostdashboard/DeleteListing';

const HostDashboardPage = ({ session }) => {
    const { listingId } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // THIS IS THE FIX: Added 'planRating' to the stats object
    const [stats, setStats] = useState({ hostRating: 4.9, planRating: 4.5, listingAge: 120, avgOnboardingTime: 6 });

    useEffect(() => {
        const fetchHostData = async () => {
            if (!listingId || !session?.user?.id) return;
            setLoading(true);
            try {
                const { data: listingData, error: listingError } = await supabase
                    .from('listings')
                    .select('*, services(*), profiles(username)')
                    .eq('id', listingId)
                    .eq('host_id', session.user.id)
                    .single();

                if (listingError) throw listingError;
                setListing(listingData);

                const { data: membersData, error: membersError } = await supabase
                    .from('bookings')
                    .select('id, joined_at, profiles(*)')
                    .eq('listing_id', listingId)
                    .eq('status', 'active');

                if (membersError) throw membersError;
                setMembers(membersData || []);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHostData();
    }, [listingId, session?.user?.id]);
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!listing) return null;

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                     <button onClick={() => navigate(-1)} className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                        Manage your <span className="text-purple-500 dark:text-purple-400">{listing.services.name}</span> Group
                    </h1>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <PlanStatsHeader 
                            service={listing.services}
                            hostRating={stats.hostRating}
                            planRating={stats.planRating}
                            listingAge={stats.listingAge}
                            avgOnboardingTime={stats.avgOnboardingTime}
                        />
                        <BuddiesList members={members} />
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <EarningsSummary 
                            basePrice={listing.services.base_price || 0}
                            memberCount={members.length}
                            platformFee={listing.services.platform_commission_rate || 10}
                        />
                        <GroupBroadcast service={listing.services} />
                        <InviteFriend 
                            hostUsername={listing.profiles.username} 
                            serviceName={listing.services.name} 
                        />
                        <DeleteListing 
                            isActiveMembers={members.length > 0} 
                            onDelete={() => alert('Archive process started!')}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HostDashboardPage;