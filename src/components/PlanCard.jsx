import React from 'react';
import { Link } from 'react-router-dom';

const PlanCard = ({ service }) => {
  const { name, base_price, description } = service;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // Enhanced pricing and stats
  const livePlansCount = 2;

  // Dynamic colors based on service name for variety
  const getServiceColors = (serviceName) => {
    const colors = {
      spotify: 'from-green-400 to-green-600',
      youtube: 'from-red-400 to-red-600',
      netflix: 'from-red-500 to-red-700',
      prime: 'from-blue-400 to-blue-600',
      disney: 'from-blue-500 to-purple-600',
      crunchyroll: 'from-orange-400 to-orange-600',
      nordvpn: 'from-cyan-400 to-blue-500',
      default: 'from-purple-400 to-indigo-500'
    };
    
    // Use the first word of the service name to determine the color
    const key = serviceName?.toLowerCase().split(' ')[0];
    return colors[key] || colors.default;
  };

  const gradientClass = getServiceColors(name);

  return (
    <Link 
      to={`/marketplace/${name.toLowerCase()}`} 
      className="group flex-shrink-0 w-[240px] h-[320px] relative overflow-hidden"
    >
      <div className="w-full h-full p-6 flex flex-col items-center text-center rounded-3xl transform transition-all duration-500 group-hover:scale-105
        bg-white border border-gray-200 shadow-lg group-hover:shadow-xl
        dark:bg-white/10 dark:backdrop-blur-xl dark:border-white/20 dark:shadow-2xl dark:group-hover:shadow-3xl dark:group-hover:shadow-purple-500/20 dark:group-hover:bg-white/15
      ">
        
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl hidden dark:block"></div>
        
        <div className={`relative z-10 w-24 h-24 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3`}>
          <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl text-gray-800 font-bold text-4xl flex items-center justify-center shadow-inner">
            {initial}
          </div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-ping"></div>
        </div>
        
        {/* --- START: MODIFIED SECTION --- */}
        {/* Fixed height container for the title to ensure it doesn't push content down */}
        <div className="h-[56px] flex items-center justify-center mb-2">
            <h3 className="relative z-10 text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-200 transition-colors duration-300 leading-tight">
                {name}
            </h3>
        </div>
        
        {/* Pricing section */}
        <div className="relative z-10">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-300 dark:to-blue-300">
                from ₹{base_price}
            </p>
            {/* Text changed as requested */}
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">per month</p>
        </div>
        {/* --- END: MODIFIED SECTION --- */}
        
        {/* Spacer to push the bottom content down */}
        <div className="flex-grow"></div>
        
        {/* Bottom content */}
        <div className="relative z-10 w-full">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-full mb-4 shadow-lg group-hover:shadow-green-500/30 transition-all duration-300 group-hover:scale-110">
                <span className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    {livePlansCount} Plans Live
                </span>
            </div>
            <p className="relative z-10 text-gray-600 dark:text-slate-300 text-sm leading-relaxed font-light group-hover:text-gray-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                {description}
            </p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/30 to-blue-500/30 group-hover:from-purple-400/50 group-hover:to-blue-400/50 transition-all duration-300"></div>
      </div>
    </Link>
  );
};

export default PlanCard;