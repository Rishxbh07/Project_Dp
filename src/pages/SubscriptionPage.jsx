import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { supabase } from '../lib/supabaseClient';
import SubscriptionCard from '../components/SubscriptionCard';
import HostedPlanCard from '../components/HostedPlanCard';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader'; // IMPORT REUSABLE HEADER
import { Filter, Plus, RefreshCw, LayoutGrid, List } from 'lucide-react';

const SubscriptionPage = ({ session }) => {
    const navigate = useNavigate(); // Hook for navigation

    // UI State
    const [activeTab, setActiveTab] = useState('subscribed'); // 'subscribed' | 'hosted'
    
    // Filter State
    const [statusFilter, setStatusFilter] = useState('Active');
    
    // Data State
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    
    // Pagination State
    const [limit, setLimit] = useState(10);
    const [hasMore, setHasMore] = useState(false);

    // Reset state when tab changes
    useEffect(() => {
        setItems([]);
        setLimit(10);
        setStatusFilter('Active');
        setLoading(true);
    }, [activeTab]);

    // Fetch Data Effect
    useEffect(() => {
        fetchData();
    }, [activeTab, statusFilter, limit, session]);

    const fetchData = async () => {
        if (!session?.user?.id) return;
        
        if (items.length === 0) setLoading(true);
        else setLoadingMore(true);

        try {
            let data = [];
            let error = null;
            let query;

            if (activeTab === 'subscribed') {
                // --- FETCHING SUBSCRIPTIONS ---
                query = supabase
                    .from('bookings')
                    .select(`
                        *,
                        listings:listing_id (
                            *,
                            services:service_id (*),
                            host_profile:host_id (username)
                        )
                    `)
                    .eq('buyer_id', session.user.id)
                    .order('joined_at', { ascending: false });

                // Apply Filters
                if (statusFilter === 'Active') {
                    query = query.eq('status', 'active');
                } else if (statusFilter === 'Inactive') {
                    query = query.in('status', ['left', 'removed', 'unpaid']);
                } else if (statusFilter === 'Expired') {
                    query = query.eq('status', 'expired');
                }

                const response = await query.range(0, limit);
                data = response.data;
                error = response.error;

                if (data) {
                    // Transform data for SubscriptionCard
                    data = data.map(b => ({
                        id: b.id,
                        serviceName: b.listings?.services?.name || 'Unknown Service',
                        hostName: b.listings?.host_profile?.username || 'Unknown Host',
                        rate: b.listings?.services?.base_price,
                        renewalDate: new Date(b.joined_at).toLocaleDateString(),
                        slotsFilled: (b.listings?.seats_total || 0) - (b.listings?.seats_available || 0),
                        slotsTotal: b.listings?.seats_total || 0,
                        path: `/subscription/${b.id}`,
                        status: b.status,
                        isPublic: b.listings?.is_public
                    }));
                }

            } else {
                // --- FETCHING HOSTED PLANS ---
                query = supabase
                    .from('listings')
                    .select(`
                        *,
                        services:service_id (*)
                    `)
                    .eq('host_id', session.user.id)
                    .order('created_at', { ascending: false });

                // Apply Filters
                if (statusFilter === 'Active') {
                    query = query.eq('status', 'active').gt('seats_available', 0);
                } else if (statusFilter === 'Full') {
                    query = query.eq('status', 'active').eq('seats_available', 0);
                } else if (statusFilter === 'Archived') {
                    query = query.eq('status', 'archived');
                }

                const response = await query.range(0, limit);
                data = response.data;
                error = response.error;

                if (data) {
                    // Transform data for HostedPlanCard
                    data = data.map(l => ({
                        id: l.id,
                        serviceName: l.services?.name,
                        total_rating: l.total_rating,
                        rating_count: l.rating_count,
                        createdAt: l.created_at,
                        seatsTotal: l.seats_total,
                        basePrice: l.services?.base_price,
                        isPublic: l.is_public
                    }));
                }
            }

            if (error) throw error;

            if (data) {
                setHasMore(data.length === limit + 1);
                setItems(data);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        setLimit(prev => prev + 10);
    };

    const FilterChip = ({ label }) => (
        <button
            onClick={() => setStatusFilter(label)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                statusFilter === label
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
        >
            {label}
        </button>
    );

    // --- LOGIC FOR INTERACTIVITY ---
    // Returns TRUE if the cards should be clickable, FALSE if they should be disabled/greyed out.
    const isInteractive = 
        (activeTab === 'subscribed' && statusFilter === 'Active') || 
        (activeTab === 'hosted' && (statusFilter === 'Active' || statusFilter === 'Full'));

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans pb-24">
            
            {/* --- REUSABLE HEADER (REPLACED MANUAL HEADER) --- */}
            <PageHeader 
                title="My Plans" 
                rightAction={
                    // Only show "Add" button if we are NOT on the hosted tab (since that button is below)
                    // Or keep it empty if you prefer the large button below.
                    // For consistency with other pages, maybe a search icon or empty space.
                    <div className="w-10" /> 
                }
            />

            {/* --- Sticky Toggle & Filter (Moved down slightly to account for fixed header) --- */}
            {/* Added top-[64px] because the PageHeader is 64px (h-16) fixed */}
            <div className="sticky top-[64px] z-10 bg-gray-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-all">
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                    
                    {/* Fixed Pill Toggle */}
                    <div className="relative mx-auto max-w-md bg-gray-200 dark:bg-slate-800 rounded-full p-1.5 flex h-14 shadow-inner">
                        {/* The Active Pill Background */}
                        <div 
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-purple-600 dark:bg-purple-500 rounded-full shadow-md transition-transform duration-300 ease-out z-0
                            ${activeTab === 'hosted' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
                        />
                        
                        {/* Subscribed Button */}
                        <button 
                            onClick={() => setActiveTab('subscribed')}
                            className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-200
                            ${activeTab === 'subscribed' ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <LayoutGrid size={18} />
                            Subscribed
                        </button>
                        
                        {/* Hosted Button */}
                        <button 
                            onClick={() => setActiveTab('hosted')}
                            className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-200
                            ${activeTab === 'hosted' ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <List size={18} />
                            Hosted
                        </button>
                    </div>

                    {/* --- Filter Section --- */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                        {/* Filter Chips */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <div className="flex items-center text-gray-400 mr-2">
                                <Filter size={16} />
                            </div>
                            {activeTab === 'subscribed' ? (
                                <>
                                    <FilterChip label="Active" />
                                    <FilterChip label="Inactive" />
                                    <FilterChip label="Expired" />
                                </>
                            ) : (
                                <>
                                    <FilterChip label="Active" />
                                    <FilterChip label="Full" />
                                    <FilterChip label="Archived" />
                                </>
                            )}
                        </div>

                        {/* Host A Plan Button (Only visible in Hosted tab) */}
                        {activeTab === 'hosted' && (
                            <Link 
                                to="/host-plan" 
                                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-purple-500/30 transition-all transform active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={18} strokeWidth={2.5} />
                                Host a Plan
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Content List --- */}
            {/* Added pt-28 to account for the double sticky headers (PageHeader + FilterBar) */}
            <main className="max-w-7xl mx-auto px-4 py-6 pt-28">
                {loading ? (
                    <div className="flex justify-center pt-20">
                        <Loader />
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'subscribed' ? (
                            items.map(item => (
                                // Wrapper Div to control interactivity
                                <div 
                                    key={item.id} 
                                    className={!isInteractive ? "pointer-events-none opacity-60 grayscale-[0.5]" : ""}
                                >
                                    <SubscriptionCard subscription={item} />
                                </div>
                            ))
                        ) : (
                            items.map(item => (
                                // Wrapper Div to control interactivity
                                <div 
                                    key={item.id} 
                                    className={!isInteractive ? "pointer-events-none opacity-60 grayscale-[0.5]" : ""}
                                >
                                    <HostedPlanCard plan={item} />
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-white/5 mx-auto max-w-md mt-8 shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            {activeTab === 'subscribed' ? <LayoutGrid size={32} /> : <List size={32} />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No {statusFilter.toLowerCase()} plans found</h3>
                        <p className="text-gray-500 dark:text-gray-400 px-6">
                            {activeTab === 'subscribed' 
                                ? "You haven't joined any plans with this status yet." 
                                : "You don't have any hosted plans with this status."}
                        </p>
                        {activeTab === 'subscribed' && (
                            <Link to="/explore" className="mt-6 inline-block text-purple-600 font-bold hover:underline">
                                Explore Marketplace
                            </Link>
                        )}
                    </div>
                )}

                {/* --- Load More Button --- */}
                {!loading && hasMore && (
                    <div className="flex justify-center mt-12">
                        <button 
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full font-semibold text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                        >
                            {loadingMore ? <Loader size="small" /> : <RefreshCw size={18} />}
                            Load More
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SubscriptionPage;