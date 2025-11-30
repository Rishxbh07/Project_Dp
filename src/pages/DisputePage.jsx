import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import Loader from '../components/common/Loader.jsx';
import { 
    AlertTriangle, 
    Send, 
    ChevronRight, 
    Calendar, 
    User, 
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    Clock,
    ShoppingBag,
    ShieldCheck,
    Users
} from 'lucide-react';

const DisputePage = ({ session }) => {
    const { bookingId: paramBookingId } = useParams();
    const navigate = useNavigate();

    // --- STATE MACHINE ---
    // 1. selectedBookingId: If present, shows FORM.
    const [selectedBookingId, setSelectedBookingId] = useState(paramBookingId || null);
    
    // 2. disputeRole: 'buyer' | 'host' | null. If null & no bookingId, shows ROLE SELECTOR.
    const [disputeRole, setDisputeRole] = useState(null);

    // 3. selectedListingForHost: If role is 'host' and this is set, shows MEMBERS list.
    const [selectedListingForHost, setSelectedListingForHost] = useState(null);

    // --- DATA STATE ---
    const [listData, setListData] = useState([]); // Stores Bookings (Buyer) or Listings (Host)
    const [membersData, setMembersData] = useState([]); // Stores Members (Host Drill-down)
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null); // Full details for Form
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- FORM STATE ---
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const disputeReasons = [
        "I did not get access to the plan.",
        "The plan is not as described.",
        "The host is unresponsive.",
        "I was removed from the plan unexpectedly.",
        "Payment issue.",
        "Other (please specify in notes)."
    ];

    // --- RESET HELPER ---
    const resetSelection = () => {
        setDisputeRole(null);
        setSelectedListingForHost(null);
        setListData([]);
        setMembersData([]);
    };

    // --- EFFECT 1: INITIAL LOAD or ROLE SWITCH ---
    useEffect(() => {
        const loadInitialData = async () => {
            if (!session?.user?.id) return;
            
            // If URL has ID, load that specific booking directly (Bypass selection)
            if (paramBookingId && !selectedBookingId) {
                setSelectedBookingId(paramBookingId);
                return;
            }

            // If we have a selected booking (either from URL or clicked), load details for FORM
            if (selectedBookingId) {
                setLoading(true);
                try {
                    // Try to fetch from RPC first to get clean details
                    const { data: bookings, error: rpcError } = await supabase
                        .rpc('get_user_active_bookings', { p_user_id: session.user.id });

                    let booking = bookings?.find(b => b.booking_id === selectedBookingId);

                    // If not found in RPC (maybe because user is Host viewing a member), fetch raw
                    if (!booking) {
                        const { data: rawBooking, error: rawError } = await supabase
                            .from('bookings')
                            .select(`
                                *,
                                listing:listings(
                                    host_id,
                                    service:services(name),
                                    profiles(username)
                                )
                            `)
                            .eq('id', selectedBookingId)
                            .single();
                        
                        if (rawError) throw rawError;

                        // Normalize structure
                        booking = {
                            booking_id: rawBooking.id,
                            service_name: rawBooking.listing.service.name,
                            host_username: rawBooking.listing.profiles.username,
                            host_id: rawBooking.listing.host_id,
                            amount_paid: 'N/A', // or fetch from transaction if needed
                            transaction_id: null
                        };
                    }

                    setSelectedBookingDetails(booking);
                } catch (err) {
                    console.error("Detail Load Error:", err);
                    setError("Could not load booking details.");
                } finally {
                    setLoading(false);
                }
                return;
            }

            // --- ROLE BASED FETCHING ---
            if (disputeRole === 'buyer') {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .rpc('get_user_active_bookings', { p_user_id: session.user.id });
                    if (error) throw error;
                    setListData(data || []);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            } else if (disputeRole === 'host') {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .rpc('get_host_active_listings', { p_host_id: session.user.id });
                    if (error) throw error;
                    setListData(data || []);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadInitialData();
    }, [disputeRole, selectedBookingId, paramBookingId, session?.user?.id]);

    // --- EFFECT 2: HOST DRILL DOWN (Fetch Members) ---
    useEffect(() => {
        const fetchMembers = async () => {
            if (disputeRole === 'host' && selectedListingForHost) {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .rpc('get_listing_active_members', { p_listing_id: selectedListingForHost.listing_id });
                    
                    if (error) throw error;
                    setMembersData(data || []);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchMembers();
    }, [disputeRole, selectedListingForHost]);


    // --- HANDLERS ---

    const handleBack = () => {
        setError('');
        if (success) {
            navigate('/dispute-status');
            return;
        }

        // Hierarchy of Back Button
        if (selectedBookingId) {
            // If in Form mode
            if (paramBookingId) {
                navigate(-1); // Came from deep link
            } else if (disputeRole === 'host') {
                setSelectedBookingId(null); // Back to Member List
            } else {
                setSelectedBookingId(null); // Back to Booking List
            }
        } else if (selectedListingForHost) {
            setSelectedListingForHost(null); // Back to Listing List
        } else if (disputeRole) {
            setDisputeRole(null); // Back to Role Selection
        } else {
            navigate(-1); // Back to Previous Page
        }
    };

    const handleSubmitDispute = async (e) => {
        e.preventDefault();
        if (!reason) return setError("Please select a reason.");
        
        setIsSubmitting(true);
        setError('');

        try {
            // Determine IDs
            const raisedBy = session.user.id;
            // Host ID is always the listing owner. 
            // If I am buyer -> activeBooking has host_id.
            // If I am Host -> selectedBookingDetails has host_id (which is ME).
            const hostId = selectedBookingDetails.host_id;

            const { error: insertError } = await supabase.from('disputes').insert({
                booking_id: selectedBookingId,
                raised_by_id: raisedBy,
                host_id: hostId, 
                reason: reason,
                notes: notes,
                transaction_id: selectedBookingDetails.transaction_id || null // Can be null for host disputes
            });

            if (insertError) throw insertError;

            setSuccess(true);
            setTimeout(() => navigate('/dispute-status'), 2500);

        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderRoleSelection = () => (
        <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Who are you raising this for?</h2>
            
            <button 
                onClick={() => setDisputeRole('buyer')}
                className="w-full bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-purple-500 group text-left transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">I am a Subscriber</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Report an issue with a plan you joined.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
            </button>

            <button 
                onClick={() => setDisputeRole('host')}
                className="w-full bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-purple-500 group text-left transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">I am a Host</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Report an issue with a member in your plan.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
            </button>
        </div>
    );

    const renderList = () => {
        if (disputeRole === 'buyer') {
            // --- BUYER VIEW: Show Bookings ---
            return (
                <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <p className="text-sm text-gray-500 mb-2">Select the subscription you have an issue with:</p>
                    {listData.length === 0 ? <p className="text-center py-10 text-gray-500">No active subscriptions found.</p> : 
                    listData.map((booking) => (
                        <button
                            key={booking.booking_id}
                            onClick={() => setSelectedBookingId(booking.booking_id)}
                            className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-purple-500 text-left transition-all group"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-500">
                                        {booking.service_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{booking.service_name}</h3>
                                        <p className="text-xs text-gray-500">Host: {booking.host_username}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>
            );
        } else {
            // --- HOST VIEW: Show Listings ---
            return (
                <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <p className="text-sm text-gray-500 mb-2">Select the plan containing the issue:</p>
                    {listData.length === 0 ? <p className="text-center py-10 text-gray-500">No active listings found.</p> : 
                    listData.map((listing) => (
                        <button
                            key={listing.listing_id}
                            onClick={() => setSelectedListingForHost(listing)}
                            className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-purple-500 text-left transition-all group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{listing.service_name}</h3>
                                    <p className="text-xs text-gray-500">{listing.seats_available} seats available</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>
            );
        }
    };

    const renderMembersList = () => (
        <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl mb-4 border border-purple-100 dark:border-purple-800/30">
                <h3 className="font-bold text-purple-900 dark:text-purple-100 text-sm">Members in {selectedListingForHost?.service_name}</h3>
                <p className="text-xs text-purple-700 dark:text-purple-300">Select the member involved in the dispute.</p>
            </div>

            {membersData.length === 0 ? (
                <p className="text-center py-10 text-gray-500">No active members in this plan.</p>
            ) : (
                membersData.map((member) => (
                    <button
                        key={member.booking_id}
                        onClick={() => setSelectedBookingId(member.booking_id)}
                        className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-purple-500 text-left transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <img src={member.pfp_url || `https://ui-avatars.com/api/?name=${member.username}`} alt={member.username} className="w-10 h-10 rounded-full" />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{member.username}</h3>
                                    <p className="text-xs text-gray-500">Joined: {new Date(member.joined_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))
            )}
        </div>
    );

    // --- MAIN RENDER ---

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900"><Loader /></div>;

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
                <div className="text-center max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl animate-in zoom-in duration-300 border border-gray-100 dark:border-white/5">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Report Submitted</h2>
                    <p className="text-gray-500 dark:text-slate-400">
                        Our team has received your report. We will review it and get back to you shortly.
                    </p>
                </div>
            </div>
        );
    }

    // Dynamic Title based on state
    let headerTitle = "Disputes";
    if (selectedBookingId) headerTitle = "Report Issue";
    else if (selectedListingForHost) headerTitle = "Select Member";
    else if (disputeRole) headerTitle = disputeRole === 'buyer' ? "Select Subscription" : "Select Plan";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans">
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between relative">
                    <button 
                        onClick={handleBack} 
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 dark:text-white truncate max-w-[60%]">
                        {headerTitle}
                    </h1>
                    <Link 
                        to="/dispute-status"
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 flex items-center gap-2"
                    >
                        <span className="hidden sm:inline text-sm font-medium">Status</span>
                        <Clock className="w-6 h-6" />
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 pt-24 pb-24">
                {/* 1. SELECTION FLOW */}
                {!selectedBookingId && (
                    <>
                        {!disputeRole && renderRoleSelection()}
                        {disputeRole && !selectedListingForHost && renderList()}
                        {disputeRole === 'host' && selectedListingForHost && renderMembersList()}
                    </>
                )}

                {/* 2. FORM FLOW */}
                {selectedBookingId && selectedBookingDetails && (
                    <div className="animate-in slide-in-from-right-8 duration-300">
                        {/* Context Card */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-white/5 mb-6 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                Dispute Details
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-xl">
                                        {selectedBookingDetails.service_name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                        {disputeRole === 'host' ? `Member: ${selectedBookingDetails.host_username}` : `Host: ${selectedBookingDetails.host_username}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {selectedBookingDetails.amount_paid !== 'N/A' ? `₹${selectedBookingDetails.amount_paid}` : 'Active'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitDispute} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 px-1">
                                    What's the issue?
                                </label>
                                <div className="space-y-2">
                                    {disputeReasons.map((r) => (
                                        <label 
                                            key={r}
                                            className={`
                                                flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                                                ${reason === r 
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500 shadow-sm' 
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-slate-600'}
                                            `}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${reason === r ? 'border-purple-500' : 'border-gray-400'}`}>
                                                {reason === r && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                                            </div>
                                            <span className={`text-sm ${reason === r ? 'font-semibold text-purple-900 dark:text-purple-100' : 'text-gray-700 dark:text-slate-300'}`}>
                                                {r}
                                            </span>
                                            <input 
                                                type="radio" 
                                                name="reason" 
                                                value={r} 
                                                checked={reason === r}
                                                onChange={() => setReason(r)}
                                                className="hidden"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 px-1">
                                    Additional Details
                                </label>
                                <textarea
                                    rows="4"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Please describe exactly what happened..."
                                    className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white placeholder:text-gray-400"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl text-sm flex items-start gap-2 border border-red-100 dark:border-red-800/30">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader size="small" color={isSubmitting ? 'white' : 'black'} /> : (
                                    <>
                                        <span>Submit Report</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DisputePage;