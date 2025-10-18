import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, UserPlus, Mail, RefreshCw, Loader2, Search, BookUser, X } from 'lucide-react';
import FriendshipProfileCard from '../components/common/FriendshipProfileCard';

const FriendsPage = ({ session }) => {
    const [activeTab, setActiveTab] = useState('friends');
    const [data, setData] = useState({ friends: [], incoming_requests: [], outgoing_requests: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search states from the new UI
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Contact states
    const [contacts, setContacts] = useState([]);
    const [contactAccess, setContactAccess] = useState('prompt');
    const [sentRequestIds, setSentRequestIds] = useState([]);

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!session) return;
        
        if (forceRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const { data: friendData, error } = await supabase.rpc('get_all_friend_data');
            if (error) throw error;
            setData(friendData);
            if (friendData.outgoing_requests) {
                setSentRequestIds(friendData.outgoing_requests.map(req => req.id));
            }
        } catch (error) {
            console.error("Error fetching friend data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [session]);

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('public:friendships')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
                fetchData(true); // Force refresh on real-time change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData]);

    // --- Using the STABLE and FAST optimistic UI logic ---
    const handleAcceptRequest = async (userId) => {
        const request = data.incoming_requests.find(req => req.id === userId);
        if (!request) return;

        setData(prev => ({
            ...prev,
            incoming_requests: prev.incoming_requests.filter(req => req.id !== userId),
            friends: [...prev.friends, request]
        }));

        const { error } = await supabase.rpc('manage_friendship', { p_friend_id: userId, p_action: 'accepted' });
        
        if (error) {
            console.error("Failed to accept request:", error);
            setData(prev => ({
                ...prev,
                incoming_requests: [...prev.incoming_requests, request],
                friends: prev.friends.filter(f => f.id !== userId)
            }));
        }
    };

    const handleDeclineRequest = async (userId) => {
        const originalRequests = [...data.incoming_requests];
        
        setData(prev => ({
            ...prev,
            incoming_requests: prev.incoming_requests.filter(req => req.id !== userId)
        }));
        
        const { error } = await supabase.rpc('manage_friendship', { p_friend_id: userId, p_action: 'removed' });
        
        if (error) {
            console.error("Failed to decline request:", error);
            setData(prev => ({ ...prev, incoming_requests: originalRequests }));
        }
    };

    const handleRemoveFriend = async (userId) => {
        const originalFriends = [...data.friends];

        setData(prev => ({
            ...prev,
            friends: prev.friends.filter(f => f.id !== userId)
        }));

        const { error } = await supabase.rpc('manage_friendship', { p_friend_id: userId, p_action: 'removed' });

        if (error) {
            console.error("Failed to remove friend:", error);
            setData(prev => ({ ...prev, friends: originalFriends }));
        }
    };
    
    const handleAddFriend = async (userId) => {
        if (sentRequestIds.includes(userId)) return;
        setSentRequestIds(prev => [...prev, userId]);
        try {
            const { error } = await supabase.rpc('send_friend_request', { p_addressee_id: userId });
            if (error) throw error;
        } catch (error) {
            console.error(`Failed to send friend request:`, error);
            setSentRequestIds(prev => prev.filter(id => id !== userId));
        }
    };
    // --- End of stable logic section ---
    
    const getCardTypeForUser = (user) => {
        if (data.friends?.some(friend => friend.id === user.id)) return 'contact-is-friend';
        if (sentRequestIds.includes(user.id)) return 'contact-request-sent';
        if (user.status === 'not-on-dapbuddy') return 'contact-not-on-dapbuddy';
        return 'contact-on-dapbuddy';
    };

    const handleInvite = async (username) => {
        const referralCode = session?.user?.id; 
        const inviteLink = `${window.location.origin}/auth?ref=${referralCode}`;
        const message = `Hey there! My username is ${username} on DapBuddy. Join me and start saving on subscriptions! ${inviteLink}`;

        if (navigator.share) {
            try { await navigator.share({ title: 'Join me on DapBuddy!', text: message }); }
            catch (error) { console.error('Error sharing:', error); }
        } else {
            alert("Please copy this message and share it with your friends:\n\n" + message);
        }
    };
    
    const handleSearch = async () => {
        if (searchQuery.trim().length === 0) return;
        setSearching(true);
        setSearchResults([]);
        try {
            const { data, error } = await supabase.rpc('search_users', { p_search_term: searchQuery });
            if (error) throw error;
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleRequestContacts = async () => {
        alert("Simulating contact access request...");
        setContactAccess('granted');
        setContacts([
            { id: 'sim_contact1', username: 'Alice', pfp_url: null, status: 'is-friend' },
            { id: 'sim_contact2', username: 'Bob', pfp_url: null, status: 'on-dapbuddy' },
            { id: 'sim_contact3', username: 'Charlie', pfp_url: null, status: 'not-on-dapbuddy' },
        ]);
    };

    const renderContentForTab = (tabId) => {
        if (loading) return (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );

        switch (tabId) {
            case 'friends':
                return data.friends?.length > 0 ? (
                    data.friends.map(user => <FriendshipProfileCard key={user.id} user={user} type="friend" onRemove={handleRemoveFriend} />)
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                            <Users className="w-10 h-10 text-purple-400" />
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold mb-2">No friends yet</p>
                        <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Start by adding contacts or searching for users!</p>
                    </div>
                );
            
            case 'contacts':
                if (contactAccess === 'granted') {
                    return contacts.length > 0 ? (
                        contacts.map(contact => (
                            <FriendshipProfileCard 
                                key={contact.id} 
                                user={contact} 
                                type={getCardTypeForUser(contact)} 
                                onAdd={handleAddFriend}
                                onInvite={handleInvite}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-500/10 flex items-center justify-center mb-4">
                                <Mail className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-slate-400 text-sm">No contacts found on DapBuddy.</p>
                        </div>
                    );
                } else {
                    return (
                        <div className="text-center p-8 border-2 border-dashed border-purple-300/50 dark:border-purple-500/30 rounded-2xl bg-purple-50/30 dark:bg-purple-900/10">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                                <BookUser className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Find friends from contacts</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Sync your contacts to easily find friends who are already on DapBuddy.</p>
                            <button onClick={handleRequestContacts} className="inline-flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/30">
                                <UserPlus className="w-4 h-4" />
                                Allow Contact Access
                            </button>
                        </div>
                    );
                }

            case 'requests':
                return data.incoming_requests?.length > 0 ? (
                    data.incoming_requests.map(user => <FriendshipProfileCard key={user.id} user={user} type="request" onAccept={handleAcceptRequest} onDecline={handleDeclineRequest} />)
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                            <UserPlus className="w-10 h-10 text-blue-400" />
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold mb-2">No new requests</p>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">Friend requests will appear here.</p>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const TABS = [
        { id: 'friends', label: 'Friends', icon: Users },
        { id: 'contacts', label: 'Contacts', icon: Mail },
        { id: 'requests', label: 'Requests', icon: UserPlus },
    ];

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-white/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Friends</h1>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowSearch(!showSearch)} 
                            className={`p-2.5 rounded-lg transition-all ${showSearch ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-500/10'}`}
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => fetchData(true)} 
                            disabled={refreshing} 
                            className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 transition-all disabled:opacity-50 hover:bg-purple-500/10 rounded-lg"
                        >
                            {refreshing ? <Loader2 className="w-5 h-5 animate-spin"/> : <RefreshCw className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
                
                {/* Search Bar - Expandable */}
                <div className={`overflow-hidden transition-all duration-300 ${showSearch ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by username..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-all"
                                    autoFocus
                                />
                            </div>
                            <button 
                                onClick={handleSearch}
                                disabled={searching || !searchQuery.trim()} 
                                className="px-6 py-3.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
                            >
                                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="p-3.5 text-gray-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Tabs */}
                <div className="md:hidden border-t border-gray-200 dark:border-white/10">
                    <nav className="flex justify-around">
                        {TABS.map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)} 
                                className={`flex-1 py-3 px-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'text-purple-500 border-b-2 border-purple-500 bg-purple-500/5' : 'text-gray-500 dark:text-slate-400'}`}
                            >
                                <tab.icon className="w-4 h-4" /> 
                                {tab.label} 
                                {tab.id === 'requests' && data.incoming_requests?.length > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg shadow-red-500/30">
                                        {data.incoming_requests.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Results Section */}
                {showSearch && searchResults.length > 0 && (
                    <div className="mb-8 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-300 dark:border-purple-500/30 overflow-hidden shadow-lg shadow-purple-500/10">
                        <div className="px-6 py-4 border-b border-purple-300 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/20">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Search className="w-5 h-5 text-purple-500" />
                                Search Results ({searchResults.length})
                            </h3>
                        </div>
                        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                            {searchResults.map(user => (
                                <FriendshipProfileCard 
                                    key={user.id} 
                                    user={user} 
                                    type={getCardTypeForUser(user)}
                                    onAdd={handleAddFriend} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {renderContentForTab(activeTab)}
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid md:grid-cols-3 md:gap-6 lg:gap-8">
                    {TABS.map(tab => (
                        <section key={tab.id} className="flex flex-col">
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm ring-1 ring-purple-500/20">
                                        <tab.icon className="w-5 h-5 text-purple-500"/>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {tab.label}
                                    </h2>
                                </div>
                                {tab.id === 'requests' && data.incoming_requests?.length > 0 && (
                                    <span className="bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse">
                                        {data.incoming_requests.length}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 space-y-3 p-6 bg-white/60 dark:bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 min-h-[400px]">
                                {renderContentForTab(tab.id)}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FriendsPage;