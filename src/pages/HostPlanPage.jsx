import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Info, LogIn, Plus, Minus, Loader2, PartyPopper, AlertTriangle, Lock, Eye, EyeOff, ShieldCheck, UserCheck, AlertCircle, Ban } from 'lucide-react';

const HostPlanPage = ({ session }) => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedService, setSelectedService] = useState(null);
    
    // Form States
    const [availableSlots, setAvailableSlots] = useState(1);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [hostAddress, setHostAddress] = useState('');
    const [isAddressFocused, setIsAddressFocused] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [planPurchaseDate, setPlanPurchaseDate] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [aliasName, setAliasName] = useState('');

    // Logic/UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // Date Warnings
    const [showDateWarning, setShowDateWarning] = useState(false);
    const [understandsDateWarning, setUnderstandsDateWarning] = useState(false);
    const [serviceEndDate, setServiceEndDate] = useState('');
    const [payoutDate, setPayoutDate] = useState('');

    // Eligibility State
    const [eligibility, setEligibility] = useState({ allowed: true, checking: false, reason: null, tier: 'standard', can_alias: false });

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate(-1);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            if (!session) { 
                setLoading(false); 
                return; 
            }
            setLoading(true);
            try {
                const { data, error } = await supabase.from('services').select('*');
                if (error) throw error;
                
                setServices(data);
                const uniqueCategories = ['All', ...new Set(data.map(s => s.category).filter(Boolean))];
                setCategories(uniqueCategories);
            } catch (err) {
                setError('Could not fetch required data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session]);
    
    // Check Eligibility when Service Changes
    useEffect(() => {
        const checkEligibility = async () => {
            if (!selectedService || !session) {
                setEligibility(prev => ({ ...prev, allowed: true, reason: null }));
                return;
            }

            setEligibility(prev => ({ ...prev, checking: true, error: null }));

            try {
                const { data, error } = await supabase.rpc('check_listing_eligibility', {
                    p_user_id: session.user.id,
                    p_service_id: selectedService
                });

                if (error) throw error;

                setEligibility({
                    allowed: data.allowed,
                    reason: data.reason,
                    tier: data.tier,
                    can_alias: data.can_alias,
                    checking: false
                });

            } catch (err) {
                console.error("Eligibility check failed:", err);
                setEligibility(prev => ({ ...prev, checking: false }));
            }
        };

        checkEligibility();
    }, [selectedService, session]);

    const selectedServiceData = services.find(s => s.id === selectedService);
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const calculatePayout = () => {
        if (!selectedServiceData) return 0;
        const basePrice = selectedServiceData.base_price || 0;
        const totalRevenue = basePrice * availableSlots;
        const platformFee = totalRevenue * ((selectedServiceData.platform_commission_rate || 0) / 100);
        return (totalRevenue - platformFee).toFixed(2);
    };

    // Date Logic
    useEffect(() => {
        if (planPurchaseDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const renewalDate = new Date(planPurchaseDate);
            renewalDate.setHours(0, 0, 0, 0);

            const oneMonthFromToday = new Date(today);
            oneMonthFromToday.setMonth(oneMonthFromToday.getMonth() + 1);

            if (renewalDate < oneMonthFromToday) {
                const requiredServiceDate = new Date();
                requiredServiceDate.setDate(new Date().getDate() + 30);
                const finalPayoutDate = new Date();
                finalPayoutDate.setDate(new Date().getDate() + 31);
                const dateFormatOptions = { day: 'numeric', month: 'short' };
                setServiceEndDate(requiredServiceDate.toLocaleDateString('en-GB', dateFormatOptions));
                setPayoutDate(finalPayoutDate.toLocaleDateString('en-GB', dateFormatOptions));
                setShowDateWarning(true);
            } else {
                setShowDateWarning(false);
            }
        } else {
            setShowDateWarning(false);
        }
        setUnderstandsDateWarning(false);
    }, [planPurchaseDate]);

    const handleServiceSelect = (serviceId) => {
        setSelectedService(serviceId);
        setAvailableSlots(1);
        setAliasName(''); // Reset alias
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setSelectedCategory(service.category);
        }
    };

    const isFormValid = () => {
        if (!selectedService || !agreeToTerms || !planPurchaseDate || !selectedServiceData) return false;
        if (showDateWarning && !understandsDateWarning) return false;
        if (['credentials', 'invite_link'].includes(selectedServiceData.sharing_method)) {
             if (!verificationEmail || !isValidEmail(verificationEmail)) return false;
        }
        if (selectedServiceData.sharing_policy === 'restricted' && !hostAddress) return false;
        if (aliasName.length > 15) return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            setError("Please fill all required fields correctly.");
            return;
        }
        setSubmitting(true);
        setError('');

        // 1. Create the listing using the RPC function (Secure, Transactional, Tier-Checked)
        const { data, error: rpcError } = await supabase.rpc('create_listing_with_tier_logic', {
            p_host_id: session.user.id,
            p_service_id: selectedService,
            p_plan_purchased_date: planPurchaseDate,
            p_seats_to_sell: availableSlots,
            p_is_public: isPublic,
            p_alias_name: aliasName || null 
        });

        if (rpcError) {
            setError(`Error creating listing: ${rpcError.message}`);
            setSubmitting(false);
            return;
        }

        const newListingId = data;

        // 2. Update the newly created listing with the Verification Email
        // (Since plan_credentials table is deprecated, we store this directly on the listing)
        if (newListingId && verificationEmail) {
            const { error: updateError } = await supabase
                .from('listings')
                .update({ 
                    emails_for_verification: verificationEmail,
                    // If you added a host_address column to listings, uncomment the line below:
                    // host_address: hostAddress 
                })
                .eq('id', newListingId);

            if (updateError) {
                console.error("Failed to save verification email:", updateError);
                // We don't block the success flow here, but we log it.
            }
        }

        setSuccess(true);
        window.dispatchEvent(new Event("refreshHostedPlans"));
    };

    const filteredServices = selectedCategory === 'All' ? services : services.filter(service => service.category === selectedCategory);

    const renderEligibilityBlocker = () => {
        if (eligibility.checking) {
            return (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-pulse">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    <p className="text-gray-500">Checking eligibility...</p>
                </div>
            );
        }

        if (!eligibility.allowed) {
            if (eligibility.reason === 'already_subscribed') {
                return (
                    <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-200 dark:border-red-500/20 text-center space-y-6 animate-in fade-in">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                            <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Conflict of Interest</h3>
                            <p className="text-gray-600 dark:text-red-200/70 mt-2">
                                You are currently an active subscriber of {selectedServiceData?.name}.<br/>
                                <span className="font-semibold text-xs uppercase tracking-wide mt-2 block opacity-75">You cannot host a service you are currently buying.</span>
                            </p>
                        </div>
                        <button onClick={() => setSelectedService(null)} className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Select Different Service</button>
                    </div>
                );
            }
            if (eligibility.reason === 'limit_reached_standard') {
                return (
                    <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-white/10 text-center space-y-6 animate-in fade-in">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                            <UserCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Limit Reached</h3>
                            <p className="text-gray-500 dark:text-slate-400 mt-2">Standard hosts can only have 1 active listing per service. Verify your profile to host more.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => navigate('/verification')} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform">Verify Now</button>
                            <button onClick={() => setSelectedService(null)} className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Go Back</button>
                        </div>
                    </div>
                );
            }
            if (eligibility.reason === 'previous_not_full') {
                return (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-8 rounded-3xl border border-yellow-200 dark:border-yellow-500/20 text-center space-y-6 animate-in fade-in">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Complete Your Previous Group</h3>
                            <p className="text-gray-600 dark:text-yellow-200/70 mt-2">You still have empty slots in your existing {selectedServiceData?.name} group. Please fill or archive it first.</p>
                        </div>
                        <button onClick={() => setSelectedService(null)} className="text-sm underline text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Select a different service</button>
                    </div>
                );
            }
            return <div className="text-center py-10 text-red-500"><p>You cannot create a listing at this time. Reason: {eligibility.reason}</p></div>;
        }
        return null;
    };


    if (!session) {
        return (
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen flex flex-col items-center justify-center text-center px-4">
                <LogIn className="w-16 h-16 text-purple-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create a Listing</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">You need to be logged in to host a plan.</p>
                <button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">Log In</button>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors text-2xl font-bold w-10 text-left">←</button>
                    <h1 className="text-xl font-bold text-center">Host a New Group</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            {success ? (
                <div className="max-w-md mx-auto px-4 py-6 text-center animate-in fade-in">
                    <div className="p-8 bg-white dark:bg-white/5 rounded-2xl">
                        <PartyPopper className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Group Listed Successfully!</h2>
                        <p className="text-gray-600 dark:text-slate-300 mt-2">Your group is now live on the marketplace.</p>
                        <p className="text-sm text-gray-400 mt-6 animate-pulse">Redirecting you now...</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* LEFT COLUMN: Service Selection */}
                        <div className="lg:col-span-8 space-y-8">
                            <section>
                                <label className="font-semibold text-lg md:text-xl mb-4 block">1. Select a category</label>
                                {/* COMPACT CATEGORY PILLS */}
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(category => (
                                        <button type="button" key={category} onClick={() => { setSelectedCategory(category); setSelectedService(null); }} className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 border ${selectedCategory === category ? 'bg-purple-500 text-white border-purple-500' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-purple-400'}`}>
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </section>
                            <section>
                                <label className="font-semibold text-lg md:text-xl mb-4 block">2. Select a service</label>
                                {/* COMPACT SERVICE GRID (RESIZED) */}
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {loading ? <p>Loading services...</p> : filteredServices.map(service => (
                                        <button type="button" key={service.id} onClick={() => handleServiceSelect(service.id)} className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center text-center h-24 ${selectedService === service.id ? 'bg-purple-500/20 border-purple-400' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'}`}>
                                            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2">{service.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Configuration Form */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 bg-white/50 dark:bg-white/5 p-6 rounded-3xl backdrop-blur-sm border border-gray-100 dark:border-white/5 transition-all">
                            {selectedServiceData ? (
                                <>
                                    {!eligibility.allowed || eligibility.checking ? (
                                        renderEligibilityBlocker()
                                    ) : (
                                        <div className="animate-in fade-in space-y-6">
                                            
                                            {/* ALIAS NAME (LIMIT 15 CHARS) */}
                                            {eligibility.can_alias && (
                                                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 rounded-xl border border-purple-500/20">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="text-sm font-semibold text-gray-800 dark:text-white">Display Alias (Optional)</label>
                                                        <span className={`text-xs ${aliasName.length >= 15 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                            {aliasName.length}/15
                                                        </span>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        placeholder={`Post as ${session.user.user_metadata?.full_name || 'an alias'}...`}
                                                        value={aliasName}
                                                        onChange={(e) => setAliasName(e.target.value)}
                                                        maxLength={15}
                                                        className="w-full p-2 bg-white dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                    />
                                                </div>
                                            )}

                                            {/* 3. Configure Plan */}
                                            <div>
                                                <label className="font-semibold text-lg mb-4 block">3. Configure your plan</label>
                                                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-transparent space-y-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-slate-400">Available slots to share:</p>
                                                        <div className="flex items-center justify-center gap-4 mt-2">
                                                            <button type="button" onClick={() => setAvailableSlots(prev => Math.max(1, prev - 1))} className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-slate-700 rounded-full font-bold text-lg"><Minus className="w-4 h-4"/></button>
                                                            <span className="text-gray-900 dark:text-white text-4xl font-bold w-16 text-center">{availableSlots}</span>
                                                            <button type="button" onClick={() => setAvailableSlots(prev => Math.min(selectedServiceData.max_seats_allowed - 1, prev + 1))} className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-slate-700 rounded-full font-bold text-lg"><Plus className="w-4 h-4"/></button>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-gray-200 dark:border-white/10 pt-4 text-center">
                                                         <p className="text-lg font-bold text-green-600 dark:text-green-400">Price per slot: ₹{selectedServiceData.base_price}/month</p>
                                                         <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Your total possible payout: <span className="font-bold">₹{calculatePayout()}/month</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4. Plan Renewal */}
                                            <div>
                                                <h3 className="font-semibold text-lg mb-2">4. Plan Renewal Date</h3>
                                                <div className="flex items-start gap-2 p-3 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs rounded-lg mb-4">
                                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    <p>Enter the date you purchased the plan. If it's a recurring plan, enter your next renewal date.</p>
                                                </div>
                                                <input
                                                    type="date"
                                                    value={planPurchaseDate}
                                                    onChange={(e) => setPlanPurchaseDate(e.target.value)}
                                                    className="[color-scheme:dark] w-full p-3 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    required
                                                />
                                            </div>

                                            {showDateWarning && (
                                                <div className="space-y-3 animate-in fade-in">
                                                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 text-sm rounded-lg">
                                                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                        <p>You need to provide service till **{serviceEndDate}** to all users since you will receive your (estimated) payout on **{payoutDate}**.</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input type="checkbox" id="understandsDateWarning" checked={understandsDateWarning} onChange={() => setUnderstandsDateWarning(!understandsDateWarning)} className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500" />
                                                        <label htmlFor="understandsDateWarning" className="ml-2 text-sm text-gray-700 dark:text-slate-300">I understand</label>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 5. Verification Details */}
                                            {!selectedServiceData.invite_link_expiration && (
                                                <div>
                                                    <h3 className="font-semibold text-lg mb-2">5. Verification Details</h3>
                                                    <div className="space-y-4">
                                                        {(selectedServiceData.sharing_method === 'credentials' || selectedServiceData.sharing_method === 'invite_link') && (
                                                            <div className="animate-in fade-in space-y-3">
                                                                <div className="flex items-start gap-2 p-3 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs rounded-lg">
                                                                    <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                                    <p>This email will be used to resolve disputes or verify proofs, please enter valid details.</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Registered Account Email <span className="text-red-500">*</span></label>
                                                                    <input 
                                                                        type="email" 
                                                                        placeholder="e.g. yourname@gmail.com" 
                                                                        value={verificationEmail} 
                                                                        onChange={e => setVerificationEmail(e.target.value)} 
                                                                        className={`w-full p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${!isValidEmail(verificationEmail) && verificationEmail ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                                                                        required
                                                                    />
                                                                    {verificationEmail && !isValidEmail(verificationEmail) && (
                                                                        <p className="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectedServiceData.sharing_policy === 'restricted' && (
                                                            <>
                                                                {isAddressFocused && (
                                                                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs rounded-lg animate-in fade-in">
                                                                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                                        <p>Please ensure this address matches the one on your {selectedServiceData.name} account to avoid issues.</p>
                                                                    </div>
                                                                )}
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter the address used on your account"
                                                                    value={hostAddress}
                                                                    onChange={e => setHostAddress(e.target.value)}
                                                                    onFocus={() => setIsAddressFocused(true)}
                                                                    onBlur={() => setIsAddressFocused(false)}
                                                                    className="w-full mt-1 p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* 6. Privacy */}
                                            <div>
                                                <h3 className="font-semibold text-lg mb-2">6. Group Privacy</h3>
                                                <div className="flex items-center p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-transparent">
                                                    <input
                                                        type="checkbox"
                                                        id="isPublic"
                                                        checked={isPublic}
                                                        onChange={() => setIsPublic(!isPublic)}
                                                        className="h-5 w-5 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <label htmlFor="isPublic" className="ml-3 flex-1">
                                                        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-200">
                                                            {isPublic ? <Eye className="w-4 h-4 text-green-500"/> : <EyeOff className="w-4 h-4 text-red-500"/>}
                                                            <span>{isPublic ? 'Public Group' : 'Private Group'}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                                            {isPublic ? 'Your group will be visible to everyone on the marketplace.' : 'Your group will only be accessible via a direct link.'}
                                                        </p>
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <input type="checkbox" id="agreeToTerms" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)} className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500" />
                                                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700 dark:text-slate-300">I have read the rules and agree to the <Link to="/terms" className="underline text-purple-500 dark:text-purple-400">T&C</Link>.</label>
                                            </div>

                                            {error && <p className="text-red-500 text-center bg-red-500/10 p-3 rounded-lg text-sm">{error}</p>}

                                            <button type="submit" disabled={!isFormValid() || submitting} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                                {submitting ? 'Posting...' : 'Host Group'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-gray-500 dark:text-slate-400 py-12">
                                    <p>Select a service from the left to configure your plan.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-24"></div>
                </form>
            )}
        </div>
    );
};

export default HostPlanPage;