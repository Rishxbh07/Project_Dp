import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AlertTriangle, LogOut, Star, ChevronRight, Zap, UserX, AlertOctagon, CheckCircle, MoreHorizontal } from 'lucide-react';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';

// Star rating component
const StarRating = ({ rating, onRatingChange, disabled = false }) => {
    return (
        <div className={`flex items-center justify-center gap-1 ${disabled ? 'cursor-not-allowed' : ''}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-8 h-8 transition-colors ${disabled ? '' : 'cursor-pointer'} ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600'}`}
                    fill={rating >= star ? 'currentColor' : 'none'}
                    onClick={() => !disabled && onRatingChange(star)}
                />
            ))}
        </div>
    );
};

const SubscriptionDetailPage = ({ session }) => {
    const { id } = useParams();
    const navigate = useNavigate(); // Hook for navigation
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [isIssueSectionOpen, setIsIssueSectionOpen] = useState(false);
    
    const [originalRating, setOriginalRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(0);
    const [isRatingEditable, setIsRatingEditable] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id || !session?.user?.id) return;
            setLoading(true);

            const { data, error } = await supabase.rpc('get_subscription_details', {
                p_booking_id: id,
                p_buyer_id: session.user.id
            });

            if (error) {
                setError('Could not load subscription details.');
                console.error(error);
            } else if (data && data.length > 0) {
                setBookingDetails(data[0]);
                const initialRating = data[0].plan_rating || 0;
                setOriginalRating(initialRating);
                setCurrentRating(initialRating);
                setIsRatingEditable(initialRating === 0);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id, session]);

    const submitRating = async () => {
        setIsSubmittingRating(true);
        const { error } = await supabase
            .from('bookings')
            .update({ service_rating: currentRating })
            .eq('id', id);

        if (error) {
            console.error("Failed to update rating:", error);
            alert("Failed to save your rating. Please try again.");
            setCurrentRating(originalRating);
        } else {
            setOriginalRating(currentRating);
        }
        setIsRatingEditable(false);
        setIsSubmittingRating(false);
    };

    const handleRaiseIssue = async (reason) => {
        if (!bookingDetails) return;
        
        const { data, error } = await supabase
            .from('disputes')
            .insert({
                booking_id: id,
                transaction_id: bookingDetails.transaction_id,
                raised_by_id: session.user.id,
                host_id: bookingDetails.host_id,
                reason: reason,
                status: 'open'
            });

        if (error) {
             alert('Failed to raise issue. Please try again.');
             console.error(error);
        } else {
            alert('Your issue has been submitted. Our support team will review it shortly.');
            setIsIssueSectionOpen(false);
        }
    };
    
    // --- MODIFIED: Functional "Leave Plan" handler ---
    const handleLeavePlan = async () => {
        setShowLeaveModal(false);
        setLoading(true); // Show a loading state

        const { error } = await supabase
            .from('bookings')
            .update({ status: 'left' }) // Update the status in the database
            .eq('id', id);

        if (error) {
            setLoading(false);
            alert('Could not leave the plan. Please try again.');
            console.error('Error leaving plan:', error);
        } else {
            // On success, navigate back to the subscriptions list
            navigate('/subscription');
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>

    return (
        <>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                        <Link to="/subscription" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                            ← Back
                        </Link>
                        <h1 className="text-xl font-bold">{bookingDetails?.service_name || 'Details'}</h1>
                        <div className="w-16"></div>
                    </div>
                </header>

                <div className="max-w-md mx-auto px-4 py-6">
                    <section className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-8 space-y-4">
                         <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-sm">Hosted by</p>
                                <p className="text-gray-900 dark:text-white font-semibold text-lg">{bookingDetails.host_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 dark:text-slate-400 text-sm">Monthly Rate</p>
                                <p className="text-purple-600 dark:text-purple-300 font-bold text-2xl">₹{bookingDetails.monthly_rate}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-sm">Plan Rating</p>
                                <p className="text-gray-900 dark:text-white font-semibold flex items-center gap-1">{currentRating.toFixed(1)} <Star className="w-4 h-4 text-yellow-400" /></p>
                            </div>
                            <div className="text-left">
                                <p className="text-gray-500 dark:text-slate-400 text-sm">Host Rating</p>
                                <p className="text-gray-900 dark:text-white font-semibold flex items-center gap-1">{bookingDetails.host_rating.toFixed(1)} <Star className="w-4 h-4 text-yellow-400" /></p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-left border-t border-gray-200 dark:border-white/10 pt-4">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-sm">Next Renewal</p>
                                <p className="text-gray-900 dark:text-white font-semibold">{new Date(bookingDetails.next_renewal).toLocaleDateString()}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-gray-500 dark:text-slate-400 text-sm">Joined on</p>
                                <p className="text-gray-900 dark:text-white font-semibold">{new Date(bookingDetails.joined_on).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </section>
                    
                    <section className="bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent rounded-2xl p-6 mb-4 text-center">
                        <h3 className="font-bold text-lg mb-3">Rate Your Experience</h3>
                        <StarRating rating={currentRating} onRatingChange={setCurrentRating} disabled={!isRatingEditable} />
                        <div className="mt-4">
                            {isRatingEditable ? (
                                <button
                                    onClick={submitRating}
                                    disabled={currentRating === originalRating || isSubmittingRating}
                                    className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingRating ? 'Saving...' : 'Submit Rating'}
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Your rating has been submitted!
                                    </p>
                                    <button
                                        onClick={() => setIsRatingEditable(true)}
                                        className="text-sm font-semibold text-purple-500 hover:underline"
                                    >
                                        Change Rating
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-transparent overflow-hidden">
                            <button onClick={() => setIsIssueSectionOpen(!isIssueSectionOpen)} className="w-full text-left flex items-center p-4 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                <AlertTriangle className="w-5 h-5 mr-4 text-yellow-500 dark:text-yellow-400" />
                                <span className="flex-1 font-semibold text-gray-800 dark:text-white">Raise an Issue</span>
                                <ChevronRight className={`w-5 h-5 text-gray-400 dark:text-slate-500 transition-transform ${isIssueSectionOpen ? 'rotate-90' : ''}`} />
                            </button>
                            {isIssueSectionOpen && (
                                <div className="p-4 border-t border-gray-200 dark:border-white/10 animate-in fade-in space-y-2">
                                    <button onClick={() => handleRaiseIssue('Accidental: Forgot Credentials / Left Plan')} className="w-full text-left text-sm p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-blue-500"/>
                                        <span>Forgot Credentials / Left Plan</span>
                                    </button>
                                     <button onClick={() => handleRaiseIssue('Host Action: Removed from plan')} className="w-full text-left text-sm p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3">
                                        <UserX className="w-5 h-5 text-red-500"/>
                                        <span>Host removed me from plan</span>
                                    </button>
                                    <button onClick={() => handleRaiseIssue('Host Action: Changed credentials')} className="w-full text-left text-sm p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3">
                                        <UserX className="w-5 h-5 text-red-500"/>
                                        <span>Host changed credentials</span>
                                    </button>
                                    <button onClick={() => handleRaiseIssue('Other: My account is suspended or locked')} className="w-full text-left text-sm p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3">
                                        <AlertOctagon className="w-5 h-5 text-orange-500"/>
                                        <span>My account is suspended/locked</span>
                                    </button>
                                    {/* --- NEW: Other... option --- */}
                                    <button onClick={() => handleRaiseIssue('Other')} className="w-full text-left text-sm p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3">
                                        <MoreHorizontal className="w-5 h-5 text-gray-500"/>
                                        <span>Other...</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button onClick={() => setShowLeaveModal(true)} className="w-full text-left bg-red-500/10 flex items-center p-4 rounded-lg hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-5 h-5 mr-4 text-red-500 dark:text-red-400" />
                            <span className="font-semibold text-red-500 dark:text-red-400">Leave Plan</span>
                        </button>
                    </section>
                </div>
            </div>

            {/* --- MODIFIED: Modal now calls the functional handleLeavePlan --- */}
            <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                        If you leave this plan, your spot will be given to someone else and you will **not receive a refund** for the current billing period.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setShowLeaveModal(false)}
                            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleLeavePlan}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Leave Anyways
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SubscriptionDetailPage;