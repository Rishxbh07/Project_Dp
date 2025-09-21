import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { Crown, Users } from 'lucide-react';

// --- NEW: DapBuddy Plan Card Component ---
const DapBuddyPlanCard = ({ plan }) => (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
        <div className="flex items-center justify-between">
            <div>
                <p className="font-bold text-lg text-gray-900 dark:text-white">DapBuddy Official Plan</p>
                <p className="text-xs text-purple-500 dark:text-purple-400 font-semibold">Guaranteed by DapBuddy</p>
            </div>
            <Crown className="w-8 h-8 text-yellow-400" />
        </div>
        <div className="mt-4 flex items-end justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Price per slot</p>
                <p className="text-2xl font-bold text-green-500">₹{plan.price_per_seat}</p>
            </div>
            <button className="bg-purple-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-purple-700 transition-all">
                Join Now
            </button>
        </div>
        <div className="text-xs text-center mt-3 text-gray-400 dark:text-slate-500">
            {plan.slots_available} of {plan.slots_total} slots available
        </div>
    </div>
);

// --- NEW: Community Plan Card Component ---
const CommunityPlanCard = ({ plan }) => (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-white/10">
         <div className="flex items-center justify-between">
            <div>
                <p className="font-semibold text-gray-800 dark:text-white">Hosted by {plan.host_id || 'A Community Member'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Community Listing</p>
            </div>
             <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div className="mt-4 flex items-end justify-between">
            <div>
                 <p className="text-sm text-gray-500 dark:text-slate-400">Price per slot</p>
                <p className="text-2xl font-bold text-green-500">₹{plan.price_per_seat}</p>
            </div>
            <button className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all">
                Join Now
            </button>
        </div>
        <div className="text-xs text-center mt-3 text-gray-400 dark:text-slate-500">
            {plan.seats_available} of {plan.seats_total} seats available
        </div>
    </div>
);


const MarketplacePage = () => {
    const { serviceName } = useParams();
    const pageTitle = serviceName ? serviceName.charAt(0).toUpperCase() + serviceName.slice(1) : 'Marketplace';

    const [activeTab, setActiveTab] = useState('community');
    const [dapBuddyPlans, setDapBuddyPlans] = useState([]);
    const [communityPlans, setCommunityPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            if (!serviceName) return;
            setLoading(true);

            // --- MOCK DATA FOR SPOTIFY ---
            if (serviceName.toLowerCase() === 'spotify') {
                setDapBuddyPlans([
                    { id: 'db_spotify_1', service_id: 'Spotify', price_per_seat: 51, slots_total: 6, slots_available: 4, status: 'active' }
                ]);
                setCommunityPlans([
                    { id: 'comm_spotify_1', service_id: 'Spotify', host_id: 'Rishabh S.', price_per_seat: 45, seats_total: 6, seats_available: 2, status: 'active' },
                    { id: 'comm_spotify_2', service_id: 'Spotify', host_id: 'Aisha K.', price_per_seat: 48, seats_total: 6, seats_available: 1, status: 'active' },
                ]);
                setLoading(false);
                return;
            }

            // --- REAL FETCHING LOGIC for other services ---
            try {
                // Fetch dapbuddy_plans for the specific service
                const { data: dapBuddyData, error: dapBuddyError } = await supabase
                    .from('dapbuddy_plans')
                    .select('*')
                    .eq('service_id', pageTitle); // Use capitalized serviceName
                if (dapBuddyError) throw dapBuddyError;
                setDapBuddyPlans(dapBuddyData);

                // Fetch listings for community plans
                const { data: listingsData, error: listingsError } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('service_id', serviceName); // Use lowercase serviceName
                if (listingsError) throw listingsError;
                setCommunityPlans(listingsData);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [serviceName, pageTitle]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="bg-gray-50 dark:bg-[#0f172a] min-h-screen font-sans text-gray-900 dark:text-white">
            <div className="max-w-md mx-auto">
                <header className="flex items-center p-4 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md z-10">
                    <Link to="/explore" className="text-2xl font-bold mr-4 text-purple-500 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        &larr;
                    </Link>
                    <h1 className="text-xl font-bold">{pageTitle} Plans</h1>
                </header>

                <main className="p-4">
                    <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6">
                        <button
                            onClick={() => handleTabClick('dapbuddy')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'dapbuddy' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-slate-400'}`}
                        >
                            DapBuddy Plan
                        </button>
                        <button
                            onClick={() => handleTabClick('community')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'community' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-slate-400'}`}
                        >
                            Community Plans
                        </button>
                    </div>

                    {loading && <Loader />}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className="space-y-4">
                            {activeTab === 'dapbuddy' && (
                                dapBuddyPlans.length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-slate-400 mt-8 p-8 bg-gray-100 dark:bg-slate-800 rounded-lg">
                                        <p className="font-semibold text-lg">Coming to DapBuddy very soon...</p>
                                    </div>
                                ) : (
                                    dapBuddyPlans.map(plan => <DapBuddyPlanCard key={plan.id} plan={plan} />)
                                )
                            )}

                            {activeTab === 'community' && (
                                communityPlans.length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-slate-400 mt-8 p-8 bg-gray-100 dark:bg-slate-800 rounded-lg">
                                        <p className="font-semibold text-lg">No community plans available yet. Be the first to host one!</p>
                                    </div>
                                ) : (
                                    communityPlans.map(plan => <CommunityPlanCard key={plan.id} plan={plan} />)
                                )
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MarketplacePage;