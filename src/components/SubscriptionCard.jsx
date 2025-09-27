import React from 'react';
import { Link } from 'react-router-dom';

const SubscriptionCard = ({ subscription }) => {
  const { id, serviceName, hostName, rate, renewalDate, slotsFilled, slotsTotal } = subscription;
  const initial = serviceName ? serviceName.charAt(0).toUpperCase() : '?';

  // --- NEW: Dynamic calculation logic using existing props ---
  const getProgressInfo = () => {
      const now = new Date();
      const endDate = new Date(renewalDate);
      const startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - 1); // Approximate start date

      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsedDuration = now.getTime() - startDate.getTime();
      
      const progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
      const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      
      let colorClass = 'bg-purple-500'; // Default to purple
      if (daysLeft <= 7 && daysLeft > 3) colorClass = 'bg-yellow-500';
      if (daysLeft <= 3) colorClass = 'bg-red-500';
      
      return { daysLeft, progress, colorClass };
  };

  const progressInfo = getProgressInfo();

  const getServiceColor = (service) => {
    if (service.toLowerCase().includes('netflix')) return 'from-red-500 to-red-800';
    if (service.toLowerCase().includes('spotify')) return 'from-green-400 to-green-600';
    return 'from-purple-500 to-indigo-600';
  };

  return (
    <Link
      to={`/subscription/${id}`}
      className="group block bg-white dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-400/50"
    >
      <div className={`w-full h-28 flex items-center justify-center bg-gradient-to-br ${getServiceColor(serviceName)}`}>
        <span className="text-white font-bold text-5xl opacity-80 group-hover:opacity-100 transition-opacity">{initial}</span>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{serviceName}</h4>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Hosted by {hostName}</p>
        
        <div className="flex justify-between items-center mb-2">
          <p className="text-xl font-bold text-purple-600 dark:text-purple-300">₹{rate}<span className="text-sm font-medium text-gray-500 dark:text-slate-400">/mo</span></p>
          <p className="text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">{slotsFilled}/{slotsTotal} filled</p>
        </div>

        {/* --- MODIFIED: Dynamic Progress Bar --- */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
            <span>Renews on {renewalDate}</span>
            <span>{progressInfo.daysLeft} days left</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className={`${progressInfo.colorClass} h-1.5 rounded-full`} style={{ width: `${progressInfo.progress}%` }}></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SubscriptionCard;