import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { Crown, Star } from 'lucide-react';

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

const CommunityPlanCard = ({ plan }) => {
    const {
        average_rating,
        seats_total,
        seats_available, // Now using the correct value from the database
        host,
        service,
        bookings
    } = plan;

    const members = bookings ? bookings.map(b => b.buyer).filter(Boolean) : [];

    // Correctly calculate total sharable slots (excluding the host)
    const sharableSlots = Math.max(0, seats_total - 1);
    
    // Correctly calculate filled slots based on sharable slots and available slots
    const slotsFilled = sharableSlots - seats_available;

    return (
        <Link to={`/join-plan/${plan.id}`} className="block">
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10 space-y-4 transition-all hover:border-purple-400/50 hover:shadow-lg">
                {/* Host and Rating Info */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Hosted by</p>
                        <p className="font-bold text-gray-800 dark:text-white">{host?.username || 'Community Member'}</p>
                    </div>
                    <div className="flex gap-3 text-xs text-right">
                        <div>
                            <p className="text-gray-500 dark:text-slate-400">Host Rating</p>
                            <div className="flex items-center justify-end gap-1 font-semibold text-yellow-500">
                                <Star className="w-3 h-3" fill="currentColor" />
                                <span>{host?.host_rating?.toFixed(1) || 'N/A'}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-slate-400">Plan Rating</p>
                             <div className="flex items-center justify-end gap-1 font-semibold text-yellow-500">
                                <Star className="w-3 h-3" fill="currentColor" />
                                <span>{average_rating?.toFixed(1) || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Member Avatars */}
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{slotsFilled} of {sharableSlots} slots filled</p>
                    <div className="flex items-center">
                        {members.slice(0, 5).map((member, index) => (
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
                         {seats_available > 0 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-slate-400" style={{ marginLeft: members.length > 0 ? '-10px' : '0' }}>
                               +{seats_available}
                            </div>
                         )}
                    </div>
                </div>

                {/* Price and Join Button */}
                <div className="flex items-end justify-between pt-2 border-t border-gray-100 dark:border-white/10">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Price per slot</p>
                        <p className="text-2xl font-bold text-green-500">₹{service?.base_price || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold py-2 px-5 rounded-lg">
                        Join Now
                    </div>
                </div>
            </div>
        </Link>
    );
};


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
            if (!serviceName) return;
            setLoading(true);

            try {
                const { data: serviceData, error: serviceError } = await supabase
                    .from('services')
                    .select('id')
                    .ilike('name', serviceName)
                    .limit(1)
                    .single();

                if (serviceError || !serviceData) throw new Error("Service not found");
                const serviceId = serviceData.id;

                const { data: dapBuddyData, error: dapBuddyError } = await supabase
                    .from('dapbuddy_plans')
                    .select('*')
                    .eq('service_id', serviceId);
                if (dapBuddyError) throw dapBuddyError;
                setDapBuddyPlans(dapBuddyData);

                const { data: listingsData, error: listingsError } = await supabase
                    .from('listings')
                    .select(`
                        id,
                        seats_total,
                        seats_available, 
                        average_rating,
                        host:profiles (
                            username,
                            host_rating
                        ),
                        service:services (
                            base_price
                        ),
                        bookings (
                            buyer:profiles (
                                username,
                                pfp_url
                            )
                        )
                    `)
                    .eq('service_id', serviceId)
                    .eq('status', 'active');

                if (listingsError) throw listingsError;
                setCommunityPlans(listingsData);

            } catch (error) {
                setError(error.message);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [serviceName]);

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
                            onClick={() => setActiveTab('dapbuddy')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'dapbuddy' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-slate-400'}`}
                        >
                            DapBuddy Plan
                        </button>
                        <button
                            onClick={() => setActiveTab('community')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'community' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-slate-400'}`}
                        >
                            Community Plans
                        </button>
                    </div>

                    {loading && <Loader />}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className="space-y-4 pb-24">
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