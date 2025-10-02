import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Info, LogIn, Plus, Minus, Loader2, PartyPopper, AlertTriangle, Lock } from 'lucide-react';

const HostPlanPage = ({ session }) => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedService, setSelectedService] = useState(null);
    const [availableSlots, setAvailableSlots] = useState(1);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [hostAddress, setHostAddress] = useState('');

    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isAddressFocused, setIsAddressFocused] = useState(false);

    const [shareLater, setShareLater] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [planPurchaseDate, setPlanPurchaseDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [showDateWarning, setShowDateWarning] = useState(false);
    const [understandsDateWarning, setUnderstandsDateWarning] = useState(false);
    const [serviceEndDate, setServiceEndDate] = useState('');
    const [payoutDate, setPayoutDate] = useState('');

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate(-1);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    useEffect(() => {
        const fetchServicesAndCategories = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('services').select('*');
            if (error) {
                setError('Could not fetch services.');
                console.error(error);
            } else {
                setServices(data);
                const uniqueCategories = ['All', ...new Set(data.map(s => s.category).filter(Boolean))];
                setCategories(uniqueCategories);
            }
            setLoading(false);
        };
        fetchServicesAndCategories();
    }, []);

    const selectedServiceData = services.find(s => s.id === selectedService);

    const calculatePayout = () => {
        if (!selectedServiceData) return 0;
        const basePrice = selectedServiceData.base_price || 0;
        const totalRevenue = basePrice * availableSlots;
        const platformFee = totalRevenue * ((selectedServiceData.platform_commission_rate || 0) / 100);
        return (totalRevenue - platformFee).toFixed(2);
    };

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
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setSelectedCategory(service.category);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            setError("Please fill all required fields correctly and agree to all terms.");
            return;
        }
        setSubmitting(true);
        setError('');

        const { data: listingData, error: listingError } = await supabase
            .from('listings')
            .insert({
                host_id: session.user.id,
                service_id: selectedService,
                plan_purchased_date: planPurchaseDate,
                seats_total: selectedServiceData.max_seats_allowed,
                seats_available: availableSlots,
                instant_share: !shareLater && !selectedServiceData.invite_link_expiration,
            })
            .select()
            .single();

        if (listingError) {
            setError(`Error creating listing: ${listingError.message}`);
            setSubmitting(false);
            return;
        }

        if (listingData && !shareLater && !selectedServiceData.invite_link_expiration) {
            const { error: credentialError } = await supabase
                .from('plan_credentials')
                .insert({
                    listing_id: listingData.id,
                    host_id: session.user.id,
                    login_email: loginEmail || null,
                    login_password_encrypted: loginPassword || null,
                    invite_link: inviteLink || null,
                    host_address: hostAddress || null,
                });

            if (credentialError) {
                setError(`Error saving credentials: ${credentialError.message}`);
                await supabase.from('listings').delete().eq('id', listingData.id);
                setSubmitting(false);
                return;
            }
        }

        setSuccess(true);
    };

    const isFormValid = () => {
        if (!selectedService || !agreeToTerms || !planPurchaseDate || !selectedServiceData) return false;
        if (showDateWarning && !understandsDateWarning) return false;

        // If the invite link expires, the form is valid without filling joining details
        if (selectedServiceData.invite_link_expiration) {
            return true;
        }

        if (shareLater) return true;
        if (selectedServiceData.sharing_method === 'credentials' && loginEmail && loginPassword) return true;
        if (selectedServiceData.sharing_method === 'invite_link' && inviteLink.startsWith('http')) return true;
        if (selectedServiceData.sharing_policy === 'restricted' && hostAddress) return true;
        if (selectedServiceData.sharing_method === null && selectedServiceData.sharing_policy !== 'restricted') return true;

        return false;
    };

    const filteredServices = selectedCategory === 'All' ? services : services.filter(service => service.category === selectedCategory);

    if (!session) {
        return (
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen flex flex-col items-center justify-center text-center px-4">
                <LogIn className="w-16 h-16 text-purple-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create a Listing</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">You need to be logged in to host a plan.</p>
                <button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
                    Log In
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors text-2xl font-bold w-10 text-left">
                        ←
                    </button>
                    <h1 className="text-xl font-bold text-center">Host a New Plan</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            {success ? (
                <div className="max-w-md mx-auto px-4 py-6 text-center animate-in fade-in">
                    <div className="p-8 bg-white dark:bg-white/5 rounded-2xl">
                        <PartyPopper className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Listing Successful!</h2>
                        <p className="text-gray-600 dark:text-slate-300 mt-2">Your plan is now live on the marketplace.</p>
                        <p className="text-sm text-gray-400 mt-6 animate-pulse">Redirecting you now...</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 py-6 space-y-8">
                    <section>
                        <label className="font-semibold text-lg mb-4 block">1. Select a category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button type="button" key={category} onClick={() => { setSelectedCategory(category); setSelectedService(null); }} className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border-2 ${selectedCategory === category ? 'bg-purple-500 text-white border-purple-500' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-purple-400'}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </section>
                    <section>
                        <label className="font-semibold text-lg mb-4 block">2. Select a service</label>
                        <div className="grid grid-cols-3 gap-4">
                            {loading ? <p>Loading services...</p> : filteredServices.map(service => (
                                <button type="button" key={service.id} onClick={() => handleServiceSelect(service.id)} className={`p-4 rounded-2xl border-2 transition-all ${selectedService === service.id ? 'bg-purple-500/20 border-purple-400' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'}`}>
                                    <span className="font-bold text-gray-900 dark:text-white">{service.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {selectedServiceData && (
                        <section className="animate-in fade-in space-y-6">
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

                            {/* --- Conditionally render joining details section --- */}
                            {!selectedServiceData.invite_link_expiration && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">5. Joining Details</h3>
                                    <div className={`space-y-4 transition-opacity ${shareLater ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                        
                                        {selectedServiceData.sharing_method === 'credentials' && (
                                            <>
                                                {isPasswordFocused && (
                                                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs rounded-lg animate-in fade-in">
                                                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                        <p>For security, please use a password that is different from your DapBuddy account password.</p>
                                                    </div>
                                                )}
                                                <input type="text" placeholder="Email or Phone Number" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} disabled={shareLater} className="w-full p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                                <input
                                                    type="password"
                                                    placeholder="Password for the Service"
                                                    value={loginPassword}
                                                    onChange={e => setLoginPassword(e.target.value)}
                                                    onFocus={() => setIsPasswordFocused(true)}
                                                    onBlur={() => setIsPasswordFocused(false)}
                                                    disabled={shareLater}
                                                    className="w-full p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 px-1">
                                                    <Lock className="w-3 h-3"/>
                                                    <span>Don't worry, your password is end-to-end encrypted.</span>
                                                </div>
                                            </>
                                        )}
                                        
                                        {selectedServiceData.sharing_method === 'invite_link' && (
                                            <input type="text" placeholder="Paste your invite link here..." value={inviteLink} onChange={e => setInviteLink(e.target.value)} disabled={shareLater} className="w-full p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
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
                                                    disabled={shareLater}
                                                    className="w-full mt-1 p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className="mt-4">
                                        <div className="flex items-center">
                                            <input type="checkbox" id="shareLater" checked={shareLater} onChange={() => setShareLater(!shareLater)} className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500" />
                                            <label htmlFor="shareLater" className="ml-2 text-sm text-gray-700 dark:text-slate-300">I prefer to share details later</label>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center">
                                <input type="checkbox" id="agreeToTerms" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)} className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500" />
                                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700 dark:text-slate-300">I have read the rules and agree to the <Link to="/terms" className="underline text-purple-500 dark:text-purple-400">T&C</Link>.</label>
                            </div>

                            {error && <p className="text-red-500 text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}

                            <button type="submit" disabled={!isFormValid() || submitting} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                {submitting ? 'Posting...' : 'Host Plan'}
                            </button>
                        </section>
                    )}
                    <div className="h-24"></div>
                </form>
            )}
        </div>
    );
};

export default HostPlanPage;