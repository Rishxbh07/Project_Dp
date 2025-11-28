import React from 'react';
import { Users, Shield, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const PlanCard = ({ plan }) => {
    // Safety check: if plan is undefined, return null or a placeholder
    if (!plan) return null;

    // Normalize data (Handle both Marketplace and Home Page data structures)
    // 1. Try to get data from nested objects (Marketplace style)
    // 2. Fallback to top-level properties (Legacy/Home style)
    
    const hostName = plan.alias_name || plan.host?.full_name || "Top Rated Host";
    const serviceName = plan.service?.name || plan.name || "Service";
    const price = plan.service?.base_price || plan.base_price || 0;
    const logoUrl = plan.service?.logo_url || "/assets/icons/Logo.png";
    const slots = plan.available_slots || plan.seats_to_sell || 0;

    // Determine location text
    let locationText = null;
    if (plan.location_data) {
        if (plan.location_data.type === 'manual') locationText = plan.location_data.address;
        else if (plan.location_data.type === 'gps') locationText = "Near you (GPS)";
    }

    return (
        <Link to={`/join-plan/${plan.id}`} className="block group h-full">
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-5 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 relative overflow-hidden h-full flex flex-col">
                
                {/* Service Icon & Price Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/10 p-2 flex items-center justify-center flex-shrink-0">
                            <img 
                                src={logoUrl} 
                                alt={serviceName} 
                                className="w-full h-full object-contain"
                                onError={(e) => e.target.src = '/assets/icons/Logo.png'} 
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">{serviceName}</h3>
                            <p className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                ₹{price}/mo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Slots & Location */}
                <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{slots} spots left</span>
                    </div>
                    
                    {locationText && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-slate-400">
                            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="truncate max-w-[150px]">{locationText}</span>
                        </div>
                    )}
                </div>

                {/* Host Info Footer */}
                <div className="border-t border-gray-100 dark:border-white/5 pt-3 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-400 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                            {hostName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-slate-400 truncate max-w-[120px]">
                            Hosted by <span className="font-medium text-gray-900 dark:text-slate-200">{hostName}</span>
                        </span>
                    </div>
                    {plan.is_verified && (
                        <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                </div>
            </div>
        </Link>
    );
};

export default PlanCard;