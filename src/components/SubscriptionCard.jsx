import React from 'react';
import { Link } from 'react-router-dom';

const SubscriptionCard = ({ subscription }) => {
  const { id, serviceName, hostName, rate, renewalDate, slotsFilled, slotsTotal } = subscription;
  const initial = serviceName ? serviceName.charAt(0).toUpperCase() : '?';

  // Dynamic colors for variety
  const getServiceColor = (service) => {
    if (service.toLowerCase().includes('netflix')) return 'from-red-500 to-red-800';
    if (service.toLowerCase().includes('spotify')) return 'from-green-400 to-green-600';
    return 'from-purple-500 to-indigo-600';
  };

  return (
    <Link
      to={`/subscription/${id}`} // Link to the new detail page
      className="group block bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-400/50"
    >
      {/* Large Icon Area */}
      <div className={`w-full h-28 flex items-center justify-center bg-gradient-to-br ${getServiceColor(serviceName)}`}>
        <span className="text-white font-bold text-5xl opacity-80 group-hover:opacity-100 transition-opacity">{initial}</span>
      </div>

      {/* Details Section */}
      <div className="p-4">
        <h4 className="font-bold text-white text-lg">{serviceName}</h4>
        <p className="text-sm text-slate-400 mb-2">Hosted by {hostName}</p>
        
        <div className="flex justify-between items-center mb-2">
          <p className="text-xl font-bold text-purple-300">₹{rate}<span className="text-sm font-medium text-slate-400">/mo</span></p>
          <p className="text-xs font-medium bg-green-500/20 text-green-300 px-2 py-1 rounded-full">{slotsFilled}/{slotsTotal} filled</p>
        </div>

        {/* Renewal Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Renews on {renewalDate}</span>
            <span>3 days left</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SubscriptionCard;