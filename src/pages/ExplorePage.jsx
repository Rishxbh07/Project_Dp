import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Search, ChevronRight, Inbox } from 'lucide-react';
import Loader from '../components/common/Loader';


const ServiceCard = ({ service }) => {
    const [stats, setStats] = useState({ listings: 0, hasDapBuddyPlan: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            
            const { count, error: listingError } = await supabase
                .from('listings')
                .select('id', { count: 'exact', head: true })
                .eq('service_id', service.id);

            const { data: dapBuddyData, error: dapBuddyError } = await supabase
                .from('dapbuddy_plans')
                .select('id')
                .eq('service_id', service.id)
                .limit(1);

            if (listingError || dapBuddyError) {
                console.error(`Error fetching stats for ${service.name}:`, listingError || dapBuddyError);
            } else {
                setStats({
                    listings: count,
                    hasDapBuddyPlan: dapBuddyData && dapBuddyData.length > 0
                });
            }
            setLoading(false);
        };
        fetchStats();
    }, [service.id, service.name]);

    return (
        <Link to={`/marketplace/${service.name.toLowerCase()}`} className="group block w-full">
            <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10 group-hover:border-purple-400 dark:group-hover:border-purple-500 transition-all group-hover:shadow-lg">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{service.name}</h3>
                    {loading ? (
                        <div className="h-12 w-3/4 animate-pulse bg-gray-200 dark:bg-slate-700 rounded mt-2"></div>
                    ) : (
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 space-y-0.5">
                            <span>{stats.listings} listings</span>
                            <span className="mx-2">|</span>
                            <span>From ₹{service.base_price || 'N/A'}</span>
                            <span className="mx-2">|</span>
                            <span className={`font-semibold ${stats.hasDapBuddyPlan ? 'text-purple-500' : 'text-gray-400'}`}>
                                {stats.hasDapBuddyPlan ? 'DapBuddy Plan ✓' : 'Community Only'}
                            </span>
                        </div>
                    )}
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 dark:text-slate-500 group-hover:text-purple-500 transition-colors" />
            </div>
        </Link>
    );
};

const ExplorePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('services').select('*');
            if (error) {
                setError('Could not fetch services.');
                console.error(error);
            } else {
                setServices(data);
                const uniqueCategories = ['All', ...new Set(data.map(s => s.category).filter(Boolean))];
                setCategories(uniqueCategories);
            }
            setLoading(false);
        };
        fetchServices();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/marketplace/${searchQuery.trim().toLowerCase()}`);
        }
    };

    const filteredServices = selectedCategory === 'All'
        ? services
        : services.filter(service => service.category === selectedCategory);

    return (
        <div className="bg-gray-50 dark:bg-[#0f172a] min-h-screen font-sans text-gray-900 dark:text-white">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 text-center">
                    <h1 className="text-xl font-bold">Explore Plans</h1>
                </div>
            </header>
            <main className="max-w-md mx-auto px-4 py-6">
                <form onSubmit={handleSearch} className="relative mb-8">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for any service..."
                        className="w-full py-3 pl-10 pr-4 bg-gray-100 dark:bg-slate-800/50 rounded-full border-2 border-transparent focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </form>
                {loading && <Loader />}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && (
                    <>
                        <section className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3">Categories</h2>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border-2 ${selectedCategory === category ? 'bg-purple-500 text-white border-purple-500' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-purple-400'}`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </section>
                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">{selectedCategory} Services</h2>
                            {/* --- REMOVED: pb-24 from this div --- */}
                            <div className="flex flex-col gap-3">
                                {filteredServices.map(service => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        </section>
                        <section className="text-center py-8">
                            <Inbox className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-800 dark:text-white">Don't see your app?</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Let us know what you're looking for!</p>
                            <Link to="/request-service">
                                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform">
                                    Request a Service
                                </button>
                            </Link>
                        </section>
                    </>
                )}
                {/* --- ADDED: Spacer div for the bottom nav bar --- */}
                <div className="h-24"></div>
            </main>
        </div>
    );
};

export default ExplorePage;