import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Star } from 'lucide-react';

const HostedPlanCard = ({ plan }) => {
    // --- FIXED: Destructuring the flat 'plan' object ---
    const {
        id,
        serviceName,
        averageRating,
        createdAt, // Renamed from created_at
        seatsTotal,  // Renamed from seats_total
        basePrice    // Renamed from base_price
    } = plan;

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expectedPayout, setExpectedPayout] = useState(0);

    const getRenewalInfo = () => {
        const startDate = new Date(createdAt);
        const now = new Date();
        
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsedDuration = now.getTime() - startDate.getTime();
        
        const progress = Math.min(100, (elapsedDuration / totalDuration) * 100);
        const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        return {
            renewsOn: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            daysLeft,
            progress
        };
    };
    
    const renewalInfo = getRenewalInfo();
    
    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            // --- MODIFIED: Use the secure RPC function ---
            const { data, error } = await supabase
                .rpc('get_listing_members', { p_listing_id: id });

            if (error) {
                console.error('Error fetching members:', error);
                setMembers([]);
            } else {
                setMembers(data);
                
                // --- FIXED: Payout calculation uses the correct prop ---
                const seatsSold = data.length;
                const pricePerSeat = basePrice / seatsTotal; // Calculate price per seat
                const payout = seatsSold > 0 ? (pricePerSeat * seatsSold).toFixed(2) : "0.00";
                setExpectedPayout(payout);
            }
            setLoading(false);
        };

        if (id) {
            fetchMembers();
        }
    }, [id, basePrice, seatsTotal]);
    
    const getServiceColor = (service) => {
        if (!service) return 'from-gray-500 to-gray-600';
        const name = service.toLowerCase();
        if (name.includes('netflix')) return 'from-red-500 to-red-800';
        if (name.includes('spotify')) return 'from-green-400 to-green-600';
        return 'from-purple-500 to-indigo-600';
    };

    const seatsAvailable = seatsTotal - members.length;

    return (
        <Link
            to={`/hosted-plan/${id}`}
            className="group block bg-white dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
            <div className={`w-full h-28 flex items-center justify-center bg-gradient-to-br ${getServiceColor(serviceName)}`}>
                <span className="text-white font-bold text-5xl opacity-80 group-hover:opacity-100 transition-opacity">
                    {serviceName?.charAt(0).toUpperCase()}
                </span>
            </div>

            <div className="p-4 space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{serviceName}</h4>
                
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="font-semibold text-gray-700 dark:text-slate-300">Rating: {(averageRating || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-slate-300">Payout: ₹{expectedPayout}</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                        <span>Renews on {renewalInfo.renewsOn}</span>
                        <span>{renewalInfo.daysLeft} days left</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${renewalInfo.progress}%` }}></div>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Members ({members.length}/{seatsTotal})</p>
                    {loading ? <p className="text-xs text-center text-gray-500">Loading members...</p> : (
                        <div className="flex items-center space-x-2">
                            {members.slice(0, 4).map((member, index) => ( // Show max 4 members
                                <div key={index} title={member.username}>
                                    {member.pfp_url ? (
                                        <img src={member.pfp_url} alt={member.username} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                            {member.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {seatsAvailable > 0 && <span className="text-xs text-gray-400">+{seatsAvailable} spots</span>}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default HostedPlanCard;