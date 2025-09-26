import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { Crown, Star } from 'lucide-react';

const CommunityPlanCard = ({ plan }) => {
    // This component expects props in camelCase, which we handle in the main page component
    const {
        id,
        averageRating,
        seatsTotal,
        seatsAvailable,
        hostUsername,
        hostRating,
        basePrice,
        members
    } = plan;

    const memberList = members || [];
    const sharableSlots = Math.max(0, seatsTotal - 1);
    const slotsFilled = sharableSlots - seatsAvailable;

    return (
        <Link to={`/join-plan/${id}`} className="block">
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10 space-y-4 transition-all hover:border-purple-400/50 hover:shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Hosted by</p>
                        <p className="font-bold text-gray-800 dark:text-white">{hostUsername || 'Community Member'}</p>
                    </div>
                    <div className="flex gap-3 text-xs text-right">
                        <div>
                            <p className="text-gray-500 dark:text-slate-400">Host Rating</p>
                            <div className="flex items-center justify-end gap-1 font-semibold text-yellow-500">
                                <Star className="w-3 h-3" fill="currentColor" />
                                <span>{(hostRating || 0).toFixed(1)}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-slate-400">Plan Rating</p>
                             <div className="flex items-center justify-end gap-1 font-semibold text-yellow-500">
                                <Star className="w-3 h-3" fill="currentColor" />
                                <span>{(averageRating || 0).toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{slotsFilled} of {sharableSlots} slots filled</p>
                    <div className="flex items-center">
                        {memberList.slice(0, 5).map((member, index) => (
                            <div key={index} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800" style={{ marginLeft: index > 0 ? '-10px' : '0' }}>
                                 {member.pfp_url ? (
                                    <img src={member.pfp_url} alt={member.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                        {member.username ? member.username.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                            </div>
                        ))}
                         {seatsAvailable > 0 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-slate-400" style={{ marginLeft: memberList.length > 0 ? '-10px' : '0' }}>
                               +{seatsAvailable}
                            </div>
                         )}
                    </div>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-gray-100 dark:border-white/10">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Price per slot</p>
                        <p className="text-2xl font-bold text-green-500">₹{basePrice || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold py-2 px-5 rounded-lg">
                        Join Now
                    </div>
                </div>
            </div>
        </Link>
    );
};


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
                <p className="text-2xl font-bold text-green-500">₹{plan.platform_price}</p>
            </div>
            <Link to={`/join-plan/${plan.id}`} className="bg-purple-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-purple-700 transition-all">
                Join Now
            </Link>
        </div>
        <div className="text-xs text-center mt-3 text-gray-400 dark:text-slate-500">
            {plan.seats_available} of {plan.seats_total} slots available
        </div>
    </div>
);


const MarketplacePage = ({ session }) => {
    const { serviceName } = useParams();
    const pageTitle = serviceName ? serviceName.charAt(0).toUpperCase() + serviceName.slice(1) : 'Marketplace';

    const [activeTab, setActiveTab] = useState('community');
    const [dapBuddyPlans, setDapBuddyPlans] = useState([]);
    const [communityPlans, setCommunityPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            if (!serviceName) {
                setError("Service name is missing.");
                setLoading(false);
                return;
            };
            setLoading(true);
            setError(null);

            try {
                // First, get the service ID from the service name
                const { data: serviceData, error: serviceError } = await supabase
                    .from('services')
                    .select('id')
                    .ilike('name', serviceName)
                    .single();

                if (serviceError || !serviceData) {
                    throw new Error(`Service "${serviceName}" not found.`);
                }
                const serviceId = serviceData.id;

                // Fetch DapBuddy and Community plans in parallel
                const [dapBuddyRes, communityRes] = await Promise.all([
                    supabase.from('dapbuddy_plans').select('*').eq('service_id', serviceId),
                    supabase.rpc('get_community_plans_for_service', {
                        p_service_id: serviceId,
                        // p_user_id is needed if your RPC uses it to check against the host_id
                        p_user_id: session?.user?.id 
                    })
                ]);

                if (dapBuddyRes.error) throw dapBuddyRes.error;
                setDapBuddyPlans(dapBuddyRes.data || []);

                if (communityRes.error) throw communityRes.error;

                // Map snake_case from the RPC response to camelCase for the component
                const formattedCommunityPlans = communityRes.data.map(plan => ({
                    id: plan.id,
                    averageRating: plan.average_rating,
                    seatsTotal: plan.seats_total,
                    seatsAvailable: plan.seats_available,
                    hostUsername: plan.host_username,
                    hostRating: plan.host_rating,
                    basePrice: plan.base_price,
                    members: plan.members || []
                }));
                setCommunityPlans(formattedCommunityPlans);

            } catch (error) {
                setError(error.message);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [serviceName, session]);

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
                            onClick={() => setActiveTab('community')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'community' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-slate-400'}`}
                        >
                            Community Plans
                        </button>
                        <button
                            onClick={() => setActiveTab('dapbuddy')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'dapbuddy' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-slate-400'}`}
                        >
                            DapBuddy Plan
                        </button>
                    </div>

                    {loading && <Loader />}
                    {error && <p className="text-center text-red-500 p-4 bg-red-500/10 rounded-lg">{error}</p>}

                    {!loading && !error && (
                        <div className="space-y-4 pb-24">
                            {activeTab === 'dapbuddy' && (
                                dapBuddyPlans.length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-slate-400 mt-8 p-8 bg-gray-100 dark:bg-slate-800 rounded-lg">
                                        <p className="font-semibold text-lg">Official DapBuddy plans are coming soon!</p>
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