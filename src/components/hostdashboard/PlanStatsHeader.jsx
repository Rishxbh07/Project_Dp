import React from 'react';
import { Star, Clock, Zap, ShieldCheck } from 'lucide-react';

const StatItem = ({ icon, label, value, className = '' }) => (
    <div className={`text-center ${className}`}>
        <div className="flex items-center justify-center gap-1.5 font-bold text-lg text-gray-800 dark:text-white">
            {icon}
            {/* SAFETY FIX: Ensure value is a number before calling toFixed */}
            <span>{(typeof value === 'number' ? value : 0).toFixed(1)}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium tracking-wide">{label}</p>
    </div>
);

const PlanStatsHeader = ({ service, hostRating, planRating, listingAge, avgOnboardingTime }) => {
    const metadata = service.service_metadata || {};
    const bgColor = metadata.primary_color || '#A855F7';
    const textColor = metadata.text_color || '#FFFFFF';

    return (
        <section className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4">
                <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl flex-shrink-0"
                            style={{ backgroundColor: bgColor, color: textColor }}
                        >
                            {service.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white truncate">{service.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 text-sky-400"/>
                        <span>{listingAge}d old</span>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <StatItem icon={<Star className="w-4 h-4 text-yellow-400"/>} label="Your Rating" value={hostRating} />
                    <StatItem icon={<ShieldCheck className="w-4 h-4 text-blue-400"/>} label="Plan Rating" value={planRating} />
                    <StatItem icon={<Zap className="w-4 h-4 text-green-400"/>} label="Avg. Onboarding" value={avgOnboardingTime} />
                </div>
            </div>
        </section>
    );
};

export default PlanStatsHeader;