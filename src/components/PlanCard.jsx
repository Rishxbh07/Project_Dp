import React from 'react';
import { Link } from 'react-router-dom';

const PlanCard = ({ service }) => {
  const { name, description } = service;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // Enhanced pricing and stats
  const minPrice = 45;
  const livePlansCount = 2;

  // Dynamic colors based on service name for variety
  const getServiceColors = (serviceName) => {
    const colors = {
      spotify: 'from-green-400 to-green-600',
      youtube: 'from-red-400 to-red-600',
      netflix: 'from-red-500 to-red-700',
      prime: 'from-blue-400 to-blue-600',
      disney: 'from-blue-500 to-purple-600',
      default: 'from-purple-400 to-indigo-500'
    };
    
    return colors[serviceName?.toLowerCase()] || colors.default;
  };

  const gradientClass = getServiceColors(name);

  return (
    <Link 
      to={`/marketplace/${name.toLowerCase()}`} 
      className="group flex-shrink-0 w-[240px] h-[320px] relative overflow-hidden"
    >
      {/* Main card with enhanced glassmorphism */}
      <div className="w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col items-center text-center text-white shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl group-hover:shadow-purple-500/20 group-hover:bg-white/15 relative overflow-hidden">
        
        {/* Subtle hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
        
        {/* Enhanced service icon with dynamic gradient */}
        <div className={`relative z-10 w-24 h-24 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3`}>
          <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl text-gray-800 font-bold text-4xl flex items-center justify-center shadow-inner">
            {initial}
          </div>
          
          {/* Sparkle effect on hover */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-ping"></div>
        </div>
        
        {/* Service name with enhanced typography */}
        <h3 className="relative z-10 text-2xl font-bold mb-2 group-hover:text-purple-200 transition-colors duration-300">
          {name}
        </h3>
        
        {/* Enhanced pricing with better visual hierarchy */}
        <div className="relative z-10 mb-3">
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">
            from ₹{minPrice}
          </p>
          <p className="text-sm text-slate-400 font-medium">/month</p>
        </div>
        
        {/* Enhanced status badge */}
        <div className="relative z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-full mb-4 shadow-lg group-hover:shadow-green-500/30 transition-all duration-300 group-hover:scale-110">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {livePlansCount} Plans Live
          </span>
        </div>
        
        {/* Enhanced description */}
        <p className="relative z-10 text-slate-300 text-sm leading-relaxed font-light group-hover:text-slate-200 transition-colors duration-300">
          {description}
        </p>
        
        {/* Subtle bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/30 to-blue-500/30 group-hover:from-purple-400/50 group-hover:to-blue-400/50 transition-all duration-300"></div>
      </div>
    </Link>
  );
};

export default PlanCard;