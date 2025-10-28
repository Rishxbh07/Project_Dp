import React from 'react';
import { Star } from 'lucide-react';

const PlanHeader = ({ serviceName, serviceMetadata, hostName, hostPfpUrl, hostRating, listingRating }) => {
    const metadata = serviceMetadata || {};
    const bgColor = metadata.primary_color || '#A855F7';
    const textColor = metadata.text_color || '#FFFFFF';
    const hostInitial = hostName ? hostName.charAt(0).toUpperCase() : '?';

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-bold text-4xl flex-shrink-0 shadow-lg" style={{ backgroundColor: bgColor, color: textColor }}>
                    {serviceName.charAt(0)}
                </div>
                <div className="flex-grow">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{serviceName}</h2>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            {hostPfpUrl ? (
                                <img src={hostPfpUrl} alt={hostName} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">{hostInitial}</div>
                            )}
                            <span className="text-sm text-gray-600 dark:text-slate-300">Hosted by <span className="font-semibold">{hostName}</span></span>
                        </div>
                        <span className="text-gray-300 dark:text-slate-600">|</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold">{(hostRating || 0).toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 text-center bg-gray-100 dark:bg-slate-800 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Plan Rating</p>
                    <div className="font-bold text-lg text-blue-500 flex items-center justify-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{(listingRating || 0).toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlanHeader;