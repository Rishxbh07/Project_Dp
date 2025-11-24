import React from 'react';
import { Users, ShieldCheck, Clock, Crown, Flame, Star, Zap, Sparkles, Baby } from 'lucide-react';

const getAgeDetails = (creationDate) => {
    if (!creationDate) return null;
    const now = new Date();
    const startDate = new Date(creationDate);
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return { text: 'Newborn', icon: Baby, color: 'text-cyan-400' };
    if (diffDays <= 30) return { text: 'Recent', icon: Sparkles, color: 'text-green-400' };
    if (diffDays <= 90) return { text: 'Established', icon: Zap, color: 'text-yellow-400' };
    if (diffDays <= 180) return { text: 'Veteran', icon: Star, color: 'text-orange-400' };
    if (diffDays <= 365) return { text: 'Legend', icon: Flame, color: 'text-red-500' };
    return { text: 'Legendary', icon: Crown, color: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(252,211,77,0.7)]' };
};

const StatItem = ({ icon: Icon, color, title, subtitle, glow }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors rounded-xl">
        <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center ${color.bg} ${glow || ''}`}>
            <Icon className={`w-6 h-6 ${color.text}`} />
        </div>
        <div>
            <p className={`font-semibold ${color.titleText || 'text-gray-900 dark:text-white'}`}>{title}</p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>
        </div>
    </div>
);

const PlanStats = ({ listing }) => {
    const { seats_total, seats_available, created_at, avg_joining_time } = listing;
    const slotsFilled = seats_total - seats_available;
    const ageDetails = getAgeDetails(created_at);
    const AgeIcon = ageDetails?.icon;

    return (
        <section className="bg-white dark:bg-slate-800/50 p-2 md:p-4 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg shadow-gray-200/50 dark:shadow-black/20 mb-6 divide-y divide-gray-100 dark:divide-white/10">
            {/* Slots */}
            <StatItem 
                icon={Users} 
                color={{ bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-500 dark:text-purple-400' }}
                title={`${slotsFilled} of ${seats_total} Slots Filled`}
                subtitle={`${seats_available} spot(s) remaining in this group`}
            />

            {/* Plan Age */}
            {ageDetails && AgeIcon && (
                <StatItem 
                    icon={AgeIcon}
                    color={{ bg: '', text: ageDetails.color, titleText: ageDetails.color }}
                    title={`${ageDetails.text} Plan`}
                    subtitle={`Active for ${Math.floor(Math.ceil(Math.abs(new Date() - new Date(created_at)) / (1000 * 60 * 60 * 24)) / 30)} months`}
                    glow={ageDetails.glow}
                />
            )}

            {/* NEW SECTION: Avg Joining Time */}
            <StatItem 
                icon={Clock}
                color={{ bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-500' }}
                title="Avg. Joining Time"
                subtitle={avg_joining_time || "Data not available"}
            />

            {/* Guarantee */}
            <StatItem 
                icon={ShieldCheck}
                color={{ bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-500' }}
                title="DapBuddy Guarantee"
                subtitle="Full refund if you don't get access."
            />
        </section>
    );
};

export default PlanStats;