import React from 'react';
import { Share2, Users, Star } from 'lucide-react';

const PlanStatsHeader = ({ listing, memberCount, onShare }) => {

    if (!listing || !listing.services) {
        return (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mt-2"></div>
            </div>
        );
    }

    const { 
        primary_color = '#6B46C1', 
        background_color = '#FFFFFF', 
        text_color = '#000000' 
    } = listing.services.service_metadata || {};

    const isDarkBg = (parseInt(background_color.slice(1, 3), 16) * 0.299 + 
                      parseInt(background_color.slice(3, 5), 16) * 0.587 + 
                      parseInt(background_color.slice(5, 7), 16) * 0.114) < 186;
    const shareButtonTextColor = isDarkBg ? 'text-white' : 'text-black';

    return (
        <div 
            className="p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700" 
            style={{ backgroundColor: background_color }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: text_color }}>
                        {listing.services.name}
                    </h2>
                    <p className="font-semibold" style={{ color: primary_color }}>
                        {listing.alias_name || 'My Group'}
                    </p>
                </div>
                <button 
                    onClick={onShare} // Added onClick handler
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-transform transform hover:scale-105 active:scale-95" 
                    style={{ backgroundColor: primary_color, color: shareButtonTextColor }}
                >
                    <Share2 size={16} />
                    Share
                </button>
            </div>
            
            <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2">
                    <Users className="opacity-70" size={20} style={{ color: text_color }} />
                    <span className="font-bold text-lg" style={{ color: text_color }}>
                        {memberCount} <span className="text-sm font-normal opacity-80">Members</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Star className="opacity-70" size={20} style={{ color: text_color }} />
                    <span className="font-bold text-lg" style={{ color: text_color }}>
                        {listing.avg_rating || 'N/A'} <span className="text-sm font-normal opacity-80">Rating</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PlanStatsHeader;