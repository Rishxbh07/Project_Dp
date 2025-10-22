// src/context/NotificationContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [friendRequestCount, setFriendRequestCount] = useState(0);
    const [subUpdatesCount, setSubUpdatesCount] = useState(0);
    const [session, setSession] = useState(null);

    // Get current session (no change here)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    // --- (MODIFICATION 1: Create a memoized fetch function) ---
    // We use useCallback so this function's reference doesn't change on every render
    const fetchAllCounts = useCallback(async () => {
        if (session) {
            const userId = session.user.id;

            // Fetch Unread Notifications
            const { count: unread, error: unreadError } = await supabase
                .from('notifications')
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('is_read', false);
            if (unreadError) console.error("Error fetching notification count:", unreadError.message);
            setUnreadCount(unread || 0);

            // Fetch Pending Friend Requests
            const { count: requests, error: requestsError } = await supabase
                .from('friendships')
                .select('id', { count: 'exact' })
                .eq('addressee_id', userId)
                .eq('status', 'pending');
            if (requestsError) console.error("Error fetching friend request count:", requestsError.message);
            setFriendRequestCount(requests || 0);
        }
    }, [session]); // This function will update if the session changes

    // Effect to fetch initial counts and listen for real-time changes
    useEffect(() => {
        if (session) {
            fetchAllCounts(); // Call it once on load

            // Set up real-time subscriptions
            const realtimeChannel = supabase.channel(`user-updates:${session.user.id}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
                    () => fetchAllCounts() // Re-fetch on external changes
                )
                .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships', filter: `addressee_id=eq.${session.user.id}` },
                    () => fetchAllCounts() // Re-fetch on external changes
                )
                .subscribe();

            return () => {
                supabase.removeChannel(realtimeChannel);
            };
        }
    }, [session, fetchAllCounts]); // Depend on fetchAllCounts

    const value = {
        unreadCount,
        friendRequestCount,
        subUpdatesCount,
        refreshCounts: fetchAllCounts, // --- (MODIFICATION 2: Expose the function) ---
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};