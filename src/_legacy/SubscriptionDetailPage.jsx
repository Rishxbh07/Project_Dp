// src/pages/SubscriptionDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AlertTriangle, LogOut, Star, IndianRupee, Calendar, Repeat, ChevronRight, Edit, UserCheck, ShieldQuestion } from 'lucide-react';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import UpdateDetailsModal from './UpdateDetailsModal';
import RequestStatusPreview from './RequestStatusPreview'; // <-- IMPORT THE NEW COMPONENT

// --- Sub-components remain unchanged ---
const InterventionNotice = () => (
    <section className="bg-red-500/10 p-6 rounded-2xl border-2 border-dashed border-red-500/50 mb-6 text-center animate-in fade-in">
        <ShieldQuestion className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="font-bold text-lg text-red-600 dark:text-red-300 mb-2">Issue Escalated to Support</h3>
        <p className="text-sm text-red-700 dark:text-red-400">
            Our support team has been notified about the account mismatch. They will review the case and get back to you within 24-48 hours. Please check your email for updates.
        </p>
    </section>
);

const MismatchResolver = ({ onUpdateClick, onAcknowledge }) => (
    <section className="bg-yellow-500/10 p-6 rounded-2xl border-2 border-dashed border-yellow-500/50 mb-6 text-center animate-in fade-in">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="font-bold text-lg text-yellow-600 dark:text-yellow-300 mb-2">Action Required</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-6">
            The host reported an issue with the account details you provided. They were unable to add you to the plan. Please update your details or acknowledge the issue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onUpdateClick} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="w-4 h-4" /> Update My Details
            </button>
            <button onClick={onAcknowledge} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors">
                <UserCheck className="w-4 h-4" /> I will join with the correct account
            </button>
        </div>
    </section>
);

const StarRating = ({ rating, onRatingChange, disabled = false }) => (
    <div className={`flex items-center justify-center gap-1 ${disabled ? 'cursor-not-allowed' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-8 h-8 transition-colors ${!disabled && 'cursor-pointer'} ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} fill={rating >= star ? 'currentColor' : 'none'} onClick={() => !disabled && onRatingChange(star)} />
        ))}
    </div>
);


const SubscriptionDetailPage = ({ session }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [originalRating, setOriginalRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(0);
    const [isRatingEditable, setIsRatingEditable] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [inviteData, setInviteData] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const fetchDetails = async () => {
        if (!id || !session?.user?.id) return;
        setLoading(true);
        setError('');

        const { data: details, error: detailsError } = await supabase.rpc('get_subscription_details', {
            p_booking_id: id,
            p_buyer_id: session.user.id
        });

        if (detailsError) {
            setError('Could not load subscription details.');
        } else if (details && details.length > 0) {
            setBookingDetails(details[0]);
            const initialRating = details[0].plan_rating || 0;
            setOriginalRating(initialRating);
            setCurrentRating(initialRating);
            setIsRatingEditable(initialRating === 0);
        } else {
             setError('Subscription not found or you do not have access.');
        }

        const { data: inviteRes } = await supabase.from('invite_link').select('*').eq('booking_id', id).maybeSingle();
        if (inviteRes) setInviteData(inviteRes);

        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [id, session]);

    const submitRating = async () => {
        setIsSubmittingRating(true);
        const { error } = await supabase.from('bookings').update({ service_rating: currentRating }).eq('id', id);
        if (error) {
            alert("Failed to save rating.");
            setCurrentRating(originalRating);
        } else {
            setOriginalRating(currentRating);
        }
        setIsRatingEditable(false);
        setIsSubmittingRating(false);
    };

    const handleLeavePlan = async () => {
        setShowLeaveModal(false);
        setLoading(true);
        const { error } = await supabase.from('bookings').update({ status: 'left' }).eq('id', id);
        if (error) {
            setLoading(false);
            alert('Could not leave the plan.');
        } else {
            navigate('/subscription');
        }
    };
    
    const handleAcknowledge = async () => {
        if (!inviteData) {
            alert("Could not find invite details to update.");
            return;
        }
        const { error } = await supabase
            .from('invite_link')
            .update({ status: 'pending_host_confirmation_retry' })
            .eq('id', inviteData.id);
        if (error) {
            alert("Could not send acknowledgement. Please try again.");
        } else {
            fetchDetails();
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error || !bookingDetails) return <p className="text-center text-red-500 mt-8">{error || 'Details not found.'}</p>;
    
    return (
        <>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                    <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                        <Link to="/subscription" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                            ← Back
                        </Link>
                        <h1 className="text-xl font-bold">{bookingDetails?.service_name || 'Details'}</h1>
                        <div className="w-16"></div>
                    </div>
                </header>
                <main className="max-w-md mx-auto px-4 py-6 pb-24">
                    <section className="flex flex-col items-center text-center mb-8">
                         {bookingDetails.host_pfp_url ? (
                            <img src={bookingDetails.host_pfp_url} alt={bookingDetails.host_name} className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-white dark:border-slate-700 shadow-lg" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl mb-3">
                                {bookingDetails.host_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{bookingDetails.host_name}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Community Host</p>
                    </section>

                    <section className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 mb-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-slate-400">Host Rating</p>
                                <p className="font-bold text-lg text-yellow-500 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {bookingDetails.host_rating.toFixed(1)}</p>
                            </div>
                            <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-slate-400">Your Plan Rating</p>
                                <p className="font-bold text-lg text-blue-500 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {(currentRating || 0).toFixed(1)}</p>
                            </div>
                        </div>
                        <div className="text-center border-t border-b border-gray-200 dark:border-white/10 py-4">
                            <p className="text-4xl font-bold text-purple-500 dark:text-purple-400 flex items-center justify-center"><IndianRupee className="w-7 h-7" />{bookingDetails.monthly_rate}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">per month</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined On</p>
                                <p className="font-semibold text-gray-800 dark:text-white mt-1">{new Date(bookingDetails.joined_on).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Next Renewal</p>
                                <p className="font-semibold text-gray-800 dark:text-white mt-1">{new Date(bookingDetails.next_renewal).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </section>
                    
                    {/* --- THIS IS THE UPDATED SECTION --- */}
                    <>
                        {inviteData?.status === 'human_intervention_required' && <InterventionNotice />}
                        {inviteData?.status === 'mismatch_reported_once' && <MismatchResolver bookingId={id} onUpdateClick={() => setShowUpdateModal(true)} onAcknowledge={handleAcknowledge} />}
                        
                        {bookingDetails.sharing_method === 'invite_link' && <RequestStatusPreview bookingId={id} />}
                    </>
                    
                    <section className="bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent rounded-2xl p-6 mb-4 text-center">
                        <h3 className="font-bold text-lg mb-3">Rate Your Experience</h3>
                        <StarRating rating={currentRating} onRatingChange={setCurrentRating} disabled={!isRatingEditable || isSubmittingRating} />
                        <div className="mt-4 h-10 flex items-center justify-center">
                            {isSubmittingRating ? <Loader /> : isRatingEditable ? (
                                <button onClick={submitRating} disabled={currentRating === originalRating} className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Submit Rating
                                </button>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-sm text-green-600 dark:text-green-400">Your rating has been submitted!</p>
                                    <button onClick={() => setIsRatingEditable(true)} className="text-xs font-semibold text-purple-500 hover:underline">Change Rating</button>
                                </div>
                            )}
                        </div>
                    </section>
                    
                    <section className="space-y-3">
                        <Link to={`/dispute/${id}`} className="w-full text-left flex items-center p-4 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-colors">
                            <AlertTriangle className="w-5 h-5 mr-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="flex-1 font-semibold text-yellow-700 dark:text-yellow-300">Raise an Issue</span>
                            <ChevronRight className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </Link>
                        <button onClick={() => setShowLeaveModal(true)} className="w-full text-left bg-red-500/10 flex items-center p-4 rounded-lg hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-5 h-5 mr-4 text-red-500 dark:text-red-400" />
                            <span className="font-semibold text-red-500 dark:text-red-400">Leave Plan</span>
                        </button>
                    </section>
                </main>
            </div>
            
            <UpdateDetailsModal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} bookingId={id} session={session} onUpdateSuccess={() => { setShowUpdateModal(false); fetchDetails(); }} />
            
            <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                        If you leave this plan, your spot will be given to someone else and you will **not receive a refund** for the current billing period.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => setShowLeaveModal(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleLeavePlan} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
                            Leave Anyways
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SubscriptionDetailPage;