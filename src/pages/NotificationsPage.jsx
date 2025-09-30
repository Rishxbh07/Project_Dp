import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Gift, UserPlus, Award, AlertTriangle, Inbox } from 'lucide-react';
import Loader from '../components/common/Loader';

// Helper to select an icon based on the notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'new_member':
      return <UserPlus className="w-6 h-6 text-blue-500" />;
    case 'achievement_unlocked':
      return <Award className="w-6 h-6 text-yellow-500" />;
    case 'payment_due':
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    case 'offer':
      return <Gift className="w-6 h-6 text-pink-500" />;
    default:
      return <Bell className="w-6 h-6 text-purple-500" />;
  }
};

const NotificationsPage = ({ session }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load notifications.');
        console.error(error);
      } else {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [session]);

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    if (error) {
      alert('Could not mark all as read. Please try again.');
    } else {
      setNotifications(
        notifications.map(n => ({ ...n, is_read: true }))
      );
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.metadata?.listing_id) {
      return `/hosted-plan/${notification.metadata.listing_id}`;
    }
    if (notification.metadata?.achievement_id) {
      return '/achievements';
    }
    return '#';
  };

  return (
    <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="w-24"></div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <div className="w-24 text-right">
            <button
              onClick={markAllAsRead}
              className="text-sm font-semibold text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {loading ? <Loader /> : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Link to={getNotificationLink(notification)} key={notification.id} className="block">
                <div
                  className={`relative bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 flex items-start gap-4 transition-all duration-300 hover:scale-105 hover:border-purple-400/50 ${!notification.is_read ? 'border-l-4 border-l-purple-500' : 'opacity-70'}`}
                >
                  {!notification.is_read && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{notification.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{notification.message}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 px-4">
            <Inbox className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">All Caught Up!</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-2">You have no new notifications.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;