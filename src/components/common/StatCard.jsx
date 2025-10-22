// src/components/common/StatCard.jsx
import React from 'react';

const StatCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
        <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;