import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Star, User, ChevronDown, ChevronUp, DollarSign, CheckCircle, XCircle, Calendar, IndianRupee } from 'lucide-react';
import Loader from '../components/common/Loader';

const MemberCard = ({ member, service }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const connectedAccount = member.connected_accounts && member.connected_accounts[0];

    return (
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                {member.user.pfp_url ? (
                    <img src={member.user.pfp_url} alt={member.user.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                        {member.user.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{member.user.username}</p>
                    <div className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
                        <User className="w-3 h-3" />
                        {/* --- THIS IS THE FIX --- */}
                        <span>Loyalty: {member.user.loyalty_score}</span>
                    </div>
                </div>
                <button className="text-gray-400 dark:text-slate-500">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-3 text-sm animate-in fade-in">
                    {service.sharing_method === 'link' && connectedAccount?.invite_link && (
                         <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-slate-400">Invite Link:</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{connectedAccount.invite_link}</span>
                        </div>
                    )}
                     {service.sharing_method !== 'link' && connectedAccount?.service_username && (
                         <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-slate-400">Service User:</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200">{connectedAccount.service_username}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Payment:</span>
                        <div className={`flex items-center gap-1.5 font-semibold ${member.payment_status === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>
                            {member.payment_status === 'Paid' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{member.payment_status}</span>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Joined:</span>
                        <span className="font-semibold text-gray-800 dark:text-slate-200">{new Date(member.joined_at).toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};


const HostedPlanDetailPage = ({ session }) => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListingDetails = async () => {
            if (!id) return;
            setLoading(true);

            const { data: listingData, error: listingError } = await supabase
                .from('listings')
                .select(`
                    *,
                    service:services(name, sharing_method, base_price, platform_commission_rate),
                    host:profiles(host_rating)
                `)
                .eq('id', id)
                .single();

            if (listingError) {
                setError('Could not load the plan details.');
                console.error(listingError);
                setLoading(false);
                return;
            }
            setListing(listingData);

            // --- THIS IS THE FIX ---
            // Changed user_rating to loyalty_score in the query
            const { data: membersData, error: membersError } = await supabase
                .from('bookings')
                .select(`
                    joined_at,
                    payment_status,
                    user:profiles (
                        username,
                        pfp_url,
                        loyalty_score
                    ),
                    connected_accounts (
                        service_username,
                        service_profile_name,
                        invite_link
                    )
                `)
                .eq('listing_id', id);

            if (membersError) {
                setError('Error fetching members.');
                console.error('Error fetching members:', membersError);
            } else {
                setMembers(membersData);
            }

            setLoading(false);
        };

        fetchListingDetails();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900"><Loader /></div>;
    if (error || !listing) return <p className="text-center text-red-500 mt-8">{error || 'Listing not found.'}</p>;

    const seatsSold = members.length;
    const potentialEarning = (listing.service.base_price * seatsSold).toFixed(2);
    const platformCut = (potentialEarning * (listing.service.platform_commission_rate / 100)).toFixed(2);
    const finalPayout = (potentialEarning - platformCut).toFixed(2);

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/subscription" className="text-purple-500 dark:text-purple-400 text-sm">
                        &larr; Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{listing.service.name}</h1>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                <section className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                        {listing.service.name.charAt(0)}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white dark:bg-white/5 p-2 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-slate-400">Host Rating</p>
                            <p className="font-bold text-lg text-yellow-500 dark:text-yellow-400 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {listing.host.host_rating.toFixed(1)}</p>
                        </div>
                        <div className="bg-white dark:bg-white/5 p-2 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-slate-400">Plan Rating</p>
                            <p className="font-bold text-lg text-blue-500 dark:text-blue-400 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {listing.average_rating.toFixed(1)}</p>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-green-500" /> Earning Breakdown</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-slate-400">Potential Earning</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200">₹{potentialEarning}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-slate-400">Platform charges ({listing.service.platform_commission_rate}%)</span>
                            <span className="font-semibold text-red-500">- ₹{platformCut}</span>
                        </div>
                         <div className="border-t border-gray-200 dark:border-white/10 my-1"></div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-300 font-bold">Final Payout</span>
                            <span className="font-bold text-green-600 dark:text-green-400">₹{finalPayout}</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Plan Members ({members.length}/{listing.seats_total})</h2>
                    {members.length > 0 ? (
                        <div className="space-y-4">
                            {members.map((member, index) => (
                                <MemberCard key={index} member={member} service={listing.service} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-slate-400 p-8 bg-white dark:bg-white/5 rounded-2xl border border-dashed dark:border-white/10">
                            No one has joined your plan yet.
                        </p>
                    )}
                </section>
                 <div className="h-24"></div>
            </main>
        </div>
    );
};

export default HostedPlanDetailPage;