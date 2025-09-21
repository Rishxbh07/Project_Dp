import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Search, ChevronRight } from 'lucide-react';
import Loader from '../components/common/Loader'; // Assuming you have this loader

// Data from your services_rows.csv
const services = [
    { id: '12b71d91-8202-459c-ac10-a2d4ceef0644', name: 'Notion AI', category: 'AI & Productivity' },
    { id: '13f542bc-6a29-415c-88aa-5690f4d7fa70', name: 'Amazon Prime Video', category: 'Streaming' },
    { id: '1d4e54e5-60d8-46b1-b421-b65f14340fa2', name: 'Amazon Prime', category: 'E-commerce' },
    { id: '26b15c90-ded0-4919-a23d-856f11d3000c', name: 'PlayStation Plus', category: 'Games' },
    { id: '2b967de4-4263-4684-bd4d-cea91bab7c56', name: 'iCloud+', category: 'Cloud Storage' },
    { id: '2fc07b66-b337-400d-aa06-32d8609716bb', name: 'ExpressVPN', category: 'Security' },
    { id: '32b56ced-bb7d-4776-a26a-5e401e7ea8cb', name: 'Amazon Music', category: 'Music' },
    { id: '37dcf68f-8bdf-4d4d-8ea4-9058ba1c9b02', name: 'Google Workspace', category: 'Software' },
    { id: '3961cf48-fc30-4e0e-83c9-960daa60f25a', name: 'Spotify', category: 'Music' },
    { id: '3cadaf24-1b8d-429f-b1db-cab1f15d3f37', name: 'Adobe Creative Cloud', category: 'Software' },
    { id: '4f2740d5-1047-4b50-888d-cc8b6dd73595', name: 'YouTube Music', category: 'Music' },
    { id: '56bb0f88-0ffb-412b-ae80-52fc656a92ad', name: 'Disney+ Hotstar', category: 'Streaming' },
    { id: '635f13bd-7e6a-43b8-adda-c56c4fd5ee3c', name: 'Google Gemini', category: 'AI & Productivity' },
    { id: '9f50558a-d7f1-4840-b87a-a6a04da6dcdd', name: 'Claude', category: 'AI & Productivity' },
    { id: 'a6b4c848-b563-4940-bc19-09a16bb62a6a', name: 'ChatGPT', category: 'AI & Productivity' },
    { id: 'b422d897-1a6b-49d7-8640-7a94aa9d4e7c', name: 'Google Drive', category: 'Cloud Storage' },
    { id: 'b8637a4b-6659-419f-ab57-249e62b49864', name: 'Microsoft Copilot', category: 'AI & Productivity' },
    { id: 'bd2ca3cb-e5b8-47b6-bc59-3f40d1162917', name: 'NordVPN', category: 'Security' },
    { id: 'bdda5caf-1cf0-4cd5-926d-9544d327d109', name: 'Tidal', category: 'Music' },
    { id: 'c4b2a491-e1fb-4e75-8392-d016ba2c9b7b', name: 'Coursera', category: 'Education' },
    { id: 'c95cdae4-009b-4777-b026-683dfb3c9d75', name: 'Xbox Game Pass', category: 'Games' },
    { id: 'cc02d79d-28dc-4150-b089-0ffb4b623b83', name: 'Netflix', category: 'Streaming' },
    { id: 'dab3d844-ee38-45c2-b86b-ce8d14bfd559', name: 'Apple Music', category: 'Music' },
    { id: 'f542c807-be04-4a71-85f6-3061cdb4ba73', name: 'Duolingo', category: 'Education' },
    { id: 'f5e64062-a245-4df0-8c3a-5071a7256d6c', name: 'Microsoft 365', category: 'Software' }
];

const categories = ['All', ...new Set(services.map(s => s.category))];

// --- UPDATED ServiceCard Component ---
const ServiceCard = ({ service }) => {
    const [stats, setStats] = useState({ listings: 0, avgPrice: 0, hasDapBuddyPlan: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const { data: listingData, error: listingError } = await supabase
                .from('listings')
                .select('price_per_seat')
                .eq('service_id', service.id);

            const { data: dapBuddyData, error: dapBuddyError } = await supabase
                .from('dapbuddy_plans')
                .select('id')
                .eq('service_id', service.name)
                .limit(1);

            if (listingError || dapBuddyError) {
                console.error("Error fetching stats:", listingError || dapBuddyError);
            } else {
                const listings = listingData.length;
                const avgPrice = listings > 0 ? listingData.reduce((acc, item) => acc + item.price_per_seat, 0) / listings : 0;
                setStats({
                    listings,
                    avgPrice: Math.round(avgPrice),
                    hasDapBuddyPlan: dapBuddyData.length > 0
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
                            <span>Avg. ₹{stats.avgPrice}</span>
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
    const navigate = useNavigate();

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
                {/* Search Bar */}
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

                {/* Categories */}
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

                {/* --- UPDATED Services List --- */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">{selectedCategory} Services</h2>
                    <div className="flex flex-col gap-3 pb-24">
                        {filteredServices.map(service => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ExplorePage;