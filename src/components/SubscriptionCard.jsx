// src/components/SubscriptionCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Lock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (status === 'pending_renewal') {
    return <div className="text-xs font-bold text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-500/20 px-2 py-1 rounded-full">Renewal Pending</div>;
  }
  if (status === 'expired' || status === 'grace_period_expired') {
    return <div className="text-xs font-bold text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-500/20 px-2 py-1 rounded-full">Expired</div>;
  }
  return null;
};

const SubscriptionCard = ({ subscription }) => {
  const { id, serviceName, hostName, rate, renewalDate, slotsFilled, slotsTotal, path, status, isPublic } = subscription;
  const initial = serviceName ? serviceName.charAt(0).toUpperCase() : '?';

  const getProgressInfo = () => {
      const now = new Date();
      const endDate = new Date(renewalDate);
      const startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - 1);

      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsedDuration = now.getTime() - startDate.getTime();
      
      const progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
      const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      
      let colorClass = 'bg-purple-500';
      if (status === 'expired' || status === 'grace_period_expired') colorClass = 'bg-red-500';
      else if (status === 'pending_renewal') colorClass = 'bg-yellow-500';
      
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
      to={path}
      className="group relative block bg-white dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-400/50"
    >
      {isPublic !== undefined && (
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full border z-10 ${
            isPublic
            ? 'bg-green-100/50 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30'
            : 'bg-gray-100/50 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600/50'
        }`}>
            {isPublic ? <Globe size={12} /> : <Lock size={12} />}
            <span>{isPublic ? 'Public' : 'Private'}</span>
        </div>
      )}

      <div className={`w-full h-28 flex items-center justify-center bg-gradient-to-br ${getServiceColor(serviceName)}`}>
        <span className="text-white font-bold text-5xl opacity-80 group-hover:opacity-100 transition-opacity">{initial}</span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{serviceName}</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Hosted by {hostName}</p>
            </div>
            <StatusBadge status={status} />
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <p className="text-xl font-bold text-purple-600 dark:text-purple-300">₹{rate}<span className="text-sm font-medium text-gray-500 dark:text-slate-400">/mo</span></p>
          <p className="text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">{slotsFilled}/{slotsTotal} filled</p>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
            <span>{status === 'expired' || status === 'grace_period_expired' ? 'Expired On' : 'Renews on'} {renewalDate}</span>
            <span>{progressInfo.daysLeft > 0 ? `${progressInfo.daysLeft} days left` : 'Ended'}</span>
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