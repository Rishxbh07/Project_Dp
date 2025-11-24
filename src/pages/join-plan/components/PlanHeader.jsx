import React from 'react';
import { Star } from 'lucide-react';

const PlanHeader = ({ service, host, planRating }) => {
    const hostRating = host?.host_rating ?? 0;
    const rating = planRating ?? 0;

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg shadow-gray-200/50 dark:shadow-black/20 mb-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <div className="w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
            </div>
            
            <div className="text-center relative z-10">
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                    <div className="relative bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center text-white font-bold text-5xl md:text-6xl shadow-lg w-full h-full transform group-hover:scale-105 transition-transform duration-300">
                        {service?.name?.charAt(0) ?? '?'}
                    </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{service?.name ?? 'Service'}</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-slate-400">
                    Hosted by <span className="font-semibold text-purple-500 dark:text-purple-300">@{host?.username ?? 'member'}</span>
                </p>
                
                <div className="flex flex-wrap justify-center mt-4 gap-3">
                    {/* Host Rating */}
                    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10">
                         <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Host Rating</span>
                         <div className="flex items-center gap-1 text-yellow-500 font-bold">
                            <Star className="w-4 h-4 fill-current" /> {hostRating.toFixed(1)}
                         </div>
                    </div>

                    {/* NEW: Plan Rating */}
                    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10">
                         <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Plan Rating</span>
                         <div className="flex items-center gap-1 text-blue-500 font-bold">
                            <Star className="w-4 h-4 fill-current" /> {rating.toFixed(1)}
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlanHeader;