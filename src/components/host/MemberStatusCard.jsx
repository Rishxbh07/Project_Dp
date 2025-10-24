// src/components/host/MemberStatusCard.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader } from 'lucide-react';

const MemberStatusCard = ({ booking }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRequest = async () => {
      if (!booking?.id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('credential_requests')
        .select('*')
        .eq('booking_id', booking.id)
        .order('request_created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching credential request:', error);
      }
      
      setRequest(data ? data[0] : null);
      setLoading(false);
    };

    fetchLatestRequest();
  }, [booking.id]);

  const getStatusDetails = () => {
    if (booking.payment_status && !booking.payment_status.toLowerCase().includes('paid')) {
      return {
        badgeText: 'Not Paid',
        badgeColor: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        action: null,
      };
    }

    if (loading) {
      return {
        badgeText: 'Loading...',
        badgeColor: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        action: <Loader className="animate-spin text-gray-400 w-5 h-5" />,
      };
    }

    const confStatus = request?.confirmation_status;
    if (confStatus === 'issue_reported') {
      return {
        badgeText: 'Issue Reported',
        badgeColor: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        action: (
          // FIX: Changed from <Link> to <div> to prevent nesting
          <div className="bg-red-500/10 text-red-500 font-semibold text-xs px-3 py-1.5 rounded-lg">
            View Issue
          </div>
        ),
      };
    }

    const reqStatus = request?.status;
    if (reqStatus === 'resolved') {
      return {
        badgeText: 'Access Confirmed',
        badgeColor: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
        action: null,
      };
    }

    if (reqStatus === 'sent_to_user') {
      return {
        badgeText: 'Details Sent',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        action: (
          // FIX: Changed from <Link> to <div> to prevent nesting
          <div className="bg-blue-500/10 text-blue-500 font-semibold text-xs px-3 py-1.5 rounded-lg">
            Resend
          </div>
        ),
      };
    }

    // Default case: 'pending_host' or no request created yet
    return {
      badgeText: 'Pending Details',
      badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
      action: (
        // FIX: Changed from <Link> to <div> to prevent nesting
        <div className="bg-yellow-500/10 text-yellow-500 font-semibold text-xs px-3 py-1.5 rounded-lg">
          Send Details
        </div>
      ),
    };
  };

  const { badgeText, badgeColor, action } = getStatusDetails();
  const userProfile = booking.profiles;
  
  if (!userProfile) return null;

  return (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-white/10 transition-transform duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-center gap-4">
        {userProfile.pfp_url ? (
          <img src={userProfile.pfp_url} alt={userProfile.username} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">{userProfile.username.charAt(0).toUpperCase()}</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white truncate">{userProfile.username}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`capitalize text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
            {action}
        </div>
      </div>
    </div>
  );
};

export default MemberStatusCard;