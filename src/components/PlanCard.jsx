import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Layers } from 'lucide-react';

const PlanCard = ({ plan }) => {
  if (!plan) return null;

  // --- 1. HANDLE DATA MAPPING ---
  const isAggregated = plan.total_listings !== undefined || plan.isAggregated;

  let rawName, price, description, members, groups;

  if (isAggregated) {
    rawName = plan.service_name;
    price = plan.starting_price;
    members = plan.total_active_members;
    groups = plan.public_groups;
  } else {
    rawName = plan.service?.name || plan.name;
    price = plan.service?.base_price || plan.base_price;
    description = plan.description || "Join this premium subscription group.";
  }

  // Trim to fix the "NordVPN " vs "NordVPN" issue
  const name = rawName ? rawName.trim() : 'Service';
  const initial = name.charAt(0).toUpperCase();

  // --- 2. COLOR LOGIC (Fixed for Visibility) ---
  const getServiceColors = (serviceName) => {
    const cleanName = serviceName.toLowerCase();
    
    // We define FULL strings for 'buttonText' to ensure Tailwind doesn't purge them
    const colors = {
      spotify: {
        from: 'from-green-400 dark:from-green-500',
        to: 'to-emerald-500 dark:to-emerald-800',
        buttonText: 'text-green-600',
        shadow: 'shadow-green-500/40 dark:shadow-green-400/30'
      },
      youtube: {
        from: 'from-red-500 dark:from-red-500',
        to: 'to-rose-600 dark:to-rose-800',
        buttonText: 'text-red-600',
        shadow: 'shadow-red-500/40 dark:shadow-red-400/40'
      },
      netflix: {
        from: 'from-red-600 dark:from-red-600',
        to: 'to-black dark:to-red-950',
        buttonText: 'text-red-600',
        shadow: 'shadow-red-500/40 dark:shadow-red-500/40'
      },
      prime: {
        from: 'from-sky-400 dark:from-sky-500',
        to: 'to-blue-600 dark:to-blue-800',
        buttonText: 'text-blue-600',
        shadow: 'shadow-blue-500/40 dark:shadow-blue-400/30'
      },
      disney: {
        from: 'from-indigo-400 dark:from-indigo-500',
        to: 'to-purple-600 dark:to-purple-800',
        buttonText: 'text-indigo-600',
        shadow: 'shadow-indigo-500/40 dark:shadow-indigo-400/30'
      },
      crunchyroll: {
        from: 'from-orange-400 dark:from-orange-500',
        to: 'to-amber-500 dark:to-amber-700',
        buttonText: 'text-orange-600',
        shadow: 'shadow-orange-500/40 dark:shadow-orange-400/30'
      },
      nordvpn: {
        // CHANGED: Using Blue accent to ensure text is visible against white button
        from: 'from-cyan-400 dark:from-cyan-500',
        to: 'to-blue-500 dark:to-blue-700',
        buttonText: 'text-blue-600', 
        shadow: 'shadow-cyan-500/40 dark:shadow-cyan-400/30'
      },
      apple: { 
        from: 'from-pink-500 dark:from-pink-600',
        to: 'to-rose-500 dark:to-rose-700',
        buttonText: 'text-pink-600',
        shadow: 'shadow-pink-500/40 dark:shadow-pink-400/30'
      },
      default: {
        from: 'from-purple-500 dark:from-purple-500',
        to: 'to-indigo-600 dark:to-indigo-800',
        buttonText: 'text-purple-600',
        shadow: 'shadow-purple-500/40 dark:shadow-purple-400/40'
      }
    };

    const key = cleanName.split(' ')[0];
    return colors[key] || colors.default;
  };

  const { from, to, buttonText, shadow } = getServiceColors(name);

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

        {/* Icon - USING INITIAL ONLY (No Image Fetching to prevent 404s) */}
        <div
          className={`relative z-10 w-20 h-20 rounded-2xl bg-white/10 border border-white/20 
          flex items-center justify-center mb-5 shadow-inner backdrop-blur-sm`}
        >
          <span className="text-4xl font-bold text-white">
            {initial}
          </span>
        </div>

        {/* Title */}
        <h3 className="relative z-10 text-xl font-extrabold mb-2 tracking-wide line-clamp-1">
          {name}
        </h3>

        {/* Price */}
        <p className="text-3xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          ₹{price}
        </p>
        <p className="text-sm text-gray-100/80 mb-4">starting at /mo</p>

        {/* CTA Button */}
        <button
          className={`mt-auto w-full py-3 bg-white ${buttonText} font-semibold 
          rounded-full shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-300`}
        >
          Join Now →
        </button>

        {/* Stats / Description */}
        {isAggregated ? (
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-white/90 font-medium">
                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-full">
                    <Layers className="w-3 h-3" />
                    <span>{groups} Groups</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-full">
                    <Users className="w-3 h-3" />
                    <span>{members} Members</span>
                </div>
            </div>
        ) : (
            <p className="mt-3 text-sm text-white/80 line-clamp-2">
              {description}
            </p>
        )}
      </div>
    </Link>
  );
};

export default PlanCard;