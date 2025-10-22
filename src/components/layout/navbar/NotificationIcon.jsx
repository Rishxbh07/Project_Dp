// src/components/layout/navbar/NotificationIcon.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

const NotificationIcon = () => {
  const { unreadCount } = useNotifications();

  return (
    <Link to="/notifications" aria-label="Notifications">
      {/* ✅ UPDATED: Adjusted padding to be slightly smaller to compensate for larger icon */}
      <button
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        {/* ✅ UPDATED: Increased icon size to w-6 h-6 for better visual balance */}
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>
    </Link>
  );
};

export default NotificationIcon;