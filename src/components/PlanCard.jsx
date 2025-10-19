import React from 'react';
import { Link } from 'react-router-dom';

const PlanCard = ({ service }) => {
  const { name, base_price, description } = service;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // --- REVISED & IMPROVED COLOR LOGIC ---
  const getServiceColors = (serviceName) => {
    const colors = {
      spotify: { // Green: Made less dark, more vibrant in dark mode
        from: 'from-green-400 dark:from-green-500',
        to: 'to-emerald-500 dark:to-emerald-800',
        accent: 'green',
        shadow: 'shadow-green-500/40 dark:shadow-green-400/30'
      },
      youtube: { // Red: Kept vibrant, with a deeper gradient
        from: 'from-red-500 dark:from-red-500',
        to: 'to-rose-600 dark:to-rose-800',
        accent: 'red',
        shadow: 'shadow-red-500/40 dark:shadow-red-400/40'
      },
      netflix: { // Netflix: Fixed the "pink" issue by fading to a deep red
        from: 'from-red-600 dark:from-red-600',
        to: 'to-black dark:to-red-950', // THIS IS THE FIX
        accent: 'red',
        shadow: 'shadow-red-500/40 dark:shadow-red-500/40'
      },
      prime: { // Blue: Enhanced for dark mode
        from: 'from-sky-400 dark:from-sky-500',
        to: 'to-blue-600 dark:to-blue-800',
        accent: 'blue',
        shadow: 'shadow-blue-500/40 dark:shadow-blue-400/30'
      },
      disney: { // Indigo: Enhanced for dark mode
        from: 'from-indigo-400 dark:from-indigo-500',
        to: 'to-purple-600 dark:to-purple-800',
        accent: 'indigo',
        shadow: 'shadow-indigo-500/40 dark:shadow-indigo-400/30'
      },
      crunchyroll: { // Orange: Preserved intensity in dark mode
        from: 'from-orange-400 dark:from-orange-500',
        to: 'to-amber-500 dark:to-amber-700',
        accent: 'orange',
        shadow: 'shadow-orange-500/40 dark:shadow-orange-400/30'
      },
      nordvpn: { // Cyan: Enhanced for dark mode
        from: 'from-cyan-400 dark:from-cyan-500',
        to: 'to-blue-500 dark:to-blue-700',
        accent: 'cyan',
        shadow: 'shadow-cyan-500/40 dark:shadow-cyan-400/30'
      },
      default: { // Purple: Preserved intensity in dark mode
        from: 'from-purple-500 dark:from-purple-500',
        to: 'to-indigo-600 dark:to-indigo-800',
        accent: 'purple',
        shadow: 'shadow-purple-500/40 dark:shadow-purple-400/40'
      }
    };
    const key = serviceName?.toLowerCase().split(' ')[0];
    return colors[key] || colors.default;
  };

  const { from, to, accent, shadow } = getServiceColors(name);

  return (
    <Link
      to={`/marketplace/${name.toLowerCase()}`}
      className="group block w-[250px] h-[340px]"
    >
      <div className={`
        relative w-full h-full p-6 flex flex-col items-center text-center 
        rounded-3xl bg-gradient-to-b ${from} ${to} text-white
        shadow-lg hover:${shadow} transition-all duration-500 
        hover:-translate-y-2 hover:scale-[1.03]
      `}>
        {/* Glow ring accent */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${from} ${to} opacity-0 
          group-hover:opacity-30 transition-opacity duration-500`}
        ></div>
        {/* Icon */}
        <div
          className={`relative z-10 w-20 h-20 rounded-2xl bg-white/10 border border-white/20 
          flex items-center justify-center mb-5 shadow-inner`}
        >
          <span className="text-4xl font-bold text-white">{initial}</span>
        </div>
        {/* Title */}
        <h3 className="relative z-10 text-xl font-extrabold mb-2 tracking-wide">
          {name}
        </h3>
        {/* Price */}
        <p className="text-3xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          from ₹{base_price}
        </p>
        <p className="text-sm text-gray-100/80 mb-4">per month</p>
        {/* CTA */}
        <button
          className={`mt-auto w-full py-3 bg-white text-${accent}-600 font-semibold 
          rounded-full shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-300`}
        >
          Join Now →
        </button>
        {/* Description */}
        <p className="mt-3 text-sm text-white/80 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default PlanCard;