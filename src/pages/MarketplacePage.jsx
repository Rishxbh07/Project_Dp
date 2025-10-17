import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import AgeBadge from '../components/common/AgeBadge';
import { Crown, Star, Users, Zap, ZapOff, ArrowDownUp, ShieldCheck, TrendingUp, TrendingDown, Tag, SlidersHorizontal, BadgePercent } from 'lucide-react';
import ExplanationGuide from '../components/common/ExplanationGuide';

// --- Reusable Plan Card Component ---
const PlanCard = ({ plan }) => {
    const {
        id, isDapBuddyPlan, total_rating, rating_count, seatsTotal, seatsAvailable,
        hostUsername, hostPfpUrl, basePrice, soloPrice, createdAt, instant_share
    } = plan;
    const averageRating = rating_count > 0 ? (total_rating / rating_count) : (isDapBuddyPlan ? 5 : 0);
    const slotsFilled = seatsTotal - seatsAvailable;
    const savings = soloPrice && basePrice > 0 ? Math.round(((soloPrice - basePrice) / soloPrice) * 100) : 0;

    return (
        <Link to={isDapBuddyPlan ? `/join-dapbuddy-plan/${id}` : `/join-plan/${id}`} className="block group">
            <div className="relative bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10 space-y-4 transition-all duration-300 hover:border-purple-400/50 hover:shadow-lg group-hover:scale-[1.02] pt-6 overflow-visible">
                {!isDapBuddyPlan && <AgeBadge createdAt={createdAt} />}
                {isDapBuddyPlan ? (
                    <div className="absolute top-0 -translate-y-1/2 right-4 z-20 flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-200 bg-purple-400/20 dark:bg-purple-400/30 py-1.5 px-3 rounded-full border border-purple-500/50">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verified by DapBuddy</span>
                    </div>
                ) : (
                    instant_share && (
                        <div className="absolute top-0 -translate-y-1/2 right-4 z-20 flex items-center gap-1.5 text-xs font-bold text-yellow-800 dark:text-yellow-200 bg-yellow-400/20 dark:bg-yellow-400/30 py-1.5 px-3 rounded-full border border-yellow-500/50">
                            <Zap className="w-4 h-4" />
                            <span>Instant Joining</span>
                        </div>
                    )
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {hostPfpUrl ? (
                            <img src={hostPfpUrl} alt={hostUsername} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${isDapBuddyPlan ? 'from-yellow-400 to-amber-500' : 'from-purple-500 to-indigo-600'} flex items-center justify-center text-white font-bold text-lg`}>
                                {isDapBuddyPlan ? <Crown className="w-6 h-6" /> : (hostUsername ? hostUsername.charAt(0).toUpperCase() : '?')}
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Hosted by</p>
                            <p className="font-bold text-lg text-gray-800 dark:text-white">{hostUsername || 'Community Member'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-gray-500 dark:text-slate-400">Rating</p>
                         <div className="flex items-center justify-end gap-1 font-semibold text-yellow-500">
                            <Star className="w-4 h-4" fill="currentColor" />
                            <span>{averageRating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-300">{slotsFilled} of {seatsTotal} slots filled</span>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-end justify-between">
                    <div>
                         <div className="flex items-baseline gap-2">
                             <p className="text-3xl font-bold text-green-500">₹{basePrice}</p>
                             {soloPrice > 0 && <p className="text-md font-medium text-gray-400 dark:text-slate-500 line-through">₹{soloPrice}</p>}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">/month per slot</p>
                    </div>
                    <div className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                        Join Now
                    </div>
                </div>
                {savings > 0 && (
                     <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 py-1.5 px-3 rounded-full">
                        <BadgePercent className="w-4 h-4" />
                        <span>Save up to {savings}% compared to a solo plan!</span>
                    </div>
                )}
            </div>
        </Link>
    );
};


const MarketplacePage = ({ session }) => {
    const { serviceName } = useParams();
    const pageTitle = serviceName ? `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Public Groups` : 'Marketplace';
    const [allPlans, setAllPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filters and Sorting State
    const [instantJoinOnly, setInstantJoinOnly] = useState(false);
    const [dapBuddyOnly, setDapBuddyOnly] = useState(false);
    const [ratingSort, setRatingSort] = useState('none');
    const [priceSort, setPriceSort] = useState('none');

    useEffect(() => {
        const fetchAllPlans = async () => {
            if (!serviceName) { setError("Service name is missing."); setLoading(false); return; }
            setLoading(true); setError(null);
            try {
                const { data: serviceData, error: serviceError } = await supabase.from('services').select('id, solo_plan_price').ilike('name', `%${serviceName}%`).single();
                if (serviceError || !serviceData) throw new Error(`Service "${serviceName}" not found.`);
                const { id: serviceId, solo_plan_price: soloPrice } = serviceData;
                
                const [dapBuddyRes, communityRes] = await Promise.all([
                    supabase.from('dapbuddy_plans').select('*').eq('service_id', serviceId),
                    supabase.from('listings').select(`*, host_profile:host_id(username, pfp_url, host_rating), service_details:service_id(base_price), members:bookings(count)`).eq('service_id', serviceId).eq('is_public', true).eq('status', 'active').neq('host_id', session?.user?.id || '00000000-0000-0000-0000-000000000000')
                ]);

                if (dapBuddyRes.error) throw dapBuddyRes.error; if (communityRes.error) throw communityRes.error;
                
                const formattedDapBuddyPlans = (dapBuddyRes.data || []).map(plan => ({ id: plan.id, isDapBuddyPlan: true, total_rating: 5, rating_count: 1, seatsTotal: plan.seats_total, seatsAvailable: plan.seats_available, hostUsername: 'DapBuddy', hostPfpUrl: null, basePrice: plan.platform_price, soloPrice: soloPrice, createdAt: plan.created_at, instant_share: true }));
                const formattedCommunityPlans = (communityRes.data || []).map(plan => ({ id: plan.id, isDapBuddyPlan: false, total_rating: plan.total_rating, rating_count: plan.rating_count, seatsTotal: plan.seats_total, seatsAvailable: plan.seats_available, hostUsername: plan.host_profile.username, hostRating: plan.host_profile.host_rating, hostPfpUrl: plan.host_profile.pfp_url, basePrice: plan.service_details.base_price, soloPrice: soloPrice, createdAt: plan.created_at, instant_share: plan.instant_share }));
                
                setAllPlans([...formattedDapBuddyPlans, ...formattedCommunityPlans]);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllPlans();
    }, [serviceName, session]);
    
    const handleRatingSort = () => {
        setPriceSort('none');
        setRatingSort(prev => (prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none'));
    };
    
    const handlePriceSort = () => {
        setRatingSort('none');
        setPriceSort(prev => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'));
    };
    
    const filteredAndSortedPlans = useMemo(() => {
        let plans = [...allPlans];
        if (dapBuddyOnly) plans = plans.filter(p => p.isDapBuddyPlan);
        if (instantJoinOnly) plans = plans.filter(p => p.instant_share === true);
        if (ratingSort !== 'none') {
            plans.sort((a, b) => {
                const ratingA = a.rating_count > 0 ? a.total_rating / a.rating_count : (a.isDapBuddyPlan ? 5 : 0);
                const ratingB = b.rating_count > 0 ? b.total_rating / b.rating_count : (b.isDapBuddyPlan ? 5 : 0);
                return ratingSort === 'desc' ? ratingB - ratingA : ratingA - ratingB;
            });
        } else if (priceSort !== 'none') {
            plans.sort((a, b) => priceSort === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice);
        }
        return plans;
    }, [allPlans, instantJoinOnly, dapBuddyOnly, ratingSort, priceSort]);

    const FilterControls = () => (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Filters & Sort</h2>
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setInstantJoinOnly(!instantJoinOnly)} className={`flex items-center gap-2 text-sm font-medium p-2 px-3 rounded-full border-2 transition-colors ${instantJoinOnly ? 'bg-yellow-400/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-200' : 'bg-gray-100 dark:bg-slate-800/50 border-transparent hover:border-gray-300 dark:hover:border-slate-600'}`}>
                    <Zap className="w-4 h-4" /> Instant Joining
                </button>
                <button onClick={() => setDapBuddyOnly(!dapBuddyOnly)} className={`flex items-center gap-2 text-sm font-medium p-2 px-3 rounded-full border-2 transition-colors ${dapBuddyOnly ? 'bg-purple-400/20 border-purple-500/50 text-purple-700 dark:text-purple-200' : 'bg-gray-100 dark:bg-slate-800/50 border-transparent hover:border-gray-300 dark:hover:border-slate-600'}`}>
                    <ShieldCheck className="w-4 h-4" /> DapBuddy Verified
                </button>
                <button onClick={handleRatingSort} className="flex items-center gap-2 text-sm font-medium p-2 px-3 rounded-full border-2 transition-colors bg-gray-100 dark:bg-slate-800/50 border-transparent hover:border-gray-300 dark:hover:border-slate-600">
                    {ratingSort === 'desc' ? <TrendingDown className="w-4 h-4 text-red-500"/> : ratingSort === 'asc' ? <TrendingUp className="w-4 h-4 text-green-500"/> : <ArrowDownUp className="w-4 h-4" />}
                    Rating
                </button>
                <button onClick={handlePriceSort} className="flex items-center gap-2 text-sm font-medium p-2 px-3 rounded-full border-2 transition-colors bg-gray-100 dark:bg-slate-800/50 border-transparent hover:border-gray-300 dark:hover:border-slate-600">
                    {priceSort === 'asc' ? <TrendingUp className="w-4 h-4 text-green-500"/> : priceSort === 'desc' ? <TrendingDown className="w-4 h-4 text-red-500"/> : <Tag className="w-4 h-4" />}
                    Price
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-[#0f172a] min-h-screen font-sans text-gray-900 dark:text-white">
            <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-[#0f172a]/80">
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-slate-700 max-w-7xl mx-auto">
                    <Link to="/explore" className="text-2xl font-bold mr-4 text-purple-500 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">&larr;</Link>
                    <h1 className="text-xl font-bold">{pageTitle}</h1>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="lg:hidden mb-6 bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                    <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex justify-between items-center w-full font-semibold">
                        <span>Filters & Sort</span>
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                    {showMobileFilters && <div className="mt-4 border-t border-gray-200 dark:border-slate-700 pt-4"><FilterControls /></div>}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 h-fit">
                        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/10 space-y-8">
                            <FilterControls />
                            <ExplanationGuide />
                        </div>
                    </aside>
                    <div className="lg:col-span-3">
                         {loading ? <div className="flex justify-center pt-16"><Loader /></div> : error ? (
                            <p className="text-center text-red-500 p-4 bg-red-500/10 rounded-lg">{error}</p>
                        ) : (
                            filteredAndSortedPlans.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredAndSortedPlans.map(plan => (
                                        <PlanCard key={`${plan.id}-${plan.isDapBuddyPlan}`} plan={plan} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 px-4 bg-white dark:bg-slate-800/50 rounded-2xl">
                                    <p className="font-semibold text-lg">No groups match your filters.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
                <div className="h-24"></div>
            </main>
        </div>
    );
};

export default MarketplacePage;