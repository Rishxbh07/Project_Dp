// src/components/PlanCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PlanCard = ({ service }) => {
  const { name, base_price, description } = service;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

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
    const key = serviceName?.toLowerCase().split(' ')[0];
    return colors[key] || colors.default;
  };

  const gradientClass = getServiceColors(name);

  return (
    <Link 
      to={`/marketplace/${name.toLowerCase()}`} 
      className="group block w-[240px] h-[320px] [perspective:1000px]"
    >
      <div className={`
        relative w-full h-full p-6 flex flex-col items-center text-center rounded-3xl 
        transform transition-all duration-500 [transform-style:preserve-3d]
        lg:group-hover:-translate-y-2 lg:group-hover:[transform:rotateX(10deg)]
        bg-white border border-gray-200 shadow-lg 
        dark:bg-slate-800/60 dark:backdrop-blur-md dark:border-white/10 
        lg:hover:shadow-2xl lg:hover:shadow-purple-500/20
      `}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 rounded-3xl hidden dark:block"></div>
        
        <div className={`
          relative z-10 w-24 h-24 bg-gradient-to-br ${gradientClass} rounded-2xl 
          flex items-center justify-center mb-4 shadow-lg transition-all duration-300
          lg:group-hover:shadow-xl [transform:translateZ(40px)]
        `}>
          <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl text-gray-800 font-bold text-4xl flex items-center justify-center shadow-inner">
            {initial}
          </div>
        </div>
        
        <div className="h-[56px] flex items-center justify-center mb-2 [transform:translateZ(20px)]">
          <h3 className="relative z-10 text-xl font-bold text-gray-900 dark:text-white lg:group-hover:text-purple-500 dark:lg:group-hover:text-purple-200 transition-colors duration-300 leading-tight">
            {name}
          </h3>
        </div>
        
        <div className="relative z-10 [transform:translateZ(20px)]">
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-300 dark:to-blue-300">
            from ₹{base_price}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">per month</p>
        </div>

        <div className="flex-grow"></div>

        {/* --- Replaced misleading count with Join Now CTA --- */}
        <div className="relative z-10 w-full [transform:translateZ(30px)]">
          <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm py-2.5 px-4 rounded-full shadow-md hover:shadow-purple-500/20 transition-all duration-300 flex items-center justify-center gap-2 lg:group-hover:scale-105">
            <span>Join Now</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <p className="relative z-10 text-gray-600 dark:text-slate-300 text-sm leading-relaxed font-light transition-opacity duration-300 lg:group-hover:opacity-0 mt-3">
            {description}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/30 to-blue-500/30 lg:group-hover:from-purple-400/50 lg:group-hover:to-blue-400/50 transition-all duration-300"></div>
      </div>
    </Link>
  );
};

export default PlanCard;
