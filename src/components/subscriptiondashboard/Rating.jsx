import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Star } from 'lucide-react';
import Loader from '../common/Loader';

const StarRating = ({ rating, onRatingChange, disabled }) => (
    <div className={`flex items-center justify-center gap-1 ${disabled ? 'cursor-not-allowed' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-8 h-8 transition-colors ${!disabled && 'cursor-pointer'} ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} fill={rating >= star ? 'currentColor' : 'none'} onClick={() => !disabled && onRatingChange(star)} />
        ))}
    </div>
);

const Rating = ({ bookingId }) => {
    const [originalRating, setOriginalRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(0);
    const [isEditable, setIsEditable] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchRating = async () => {
            const { data } = await supabase.from('bookings').select('service_rating').eq('id', bookingId).single();
            const rating = data?.service_rating || 0;
            setOriginalRating(rating);
            setCurrentRating(rating);
            setIsEditable(rating === 0);
        };
        fetchRating();
    }, [bookingId]);

    const submitRating = async () => {
        setIsSubmitting(true);
        const { error } = await supabase.from('bookings').update({ service_rating: currentRating }).eq('id', bookingId);
        if (error) {
            alert("Failed to save rating.");
            setCurrentRating(originalRating); // Revert on error
        } else {
            setOriginalRating(currentRating);
        }
        setIsEditable(false);
        setIsSubmitting(false);
    };

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/10 text-center">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Rate Your Experience</h3>
            <StarRating rating={currentRating} onRatingChange={setCurrentRating} disabled={!isEditable || isSubmitting} />
            <div className="mt-4 h-10 flex items-center justify-center">
                {isSubmitting ? <Loader size="small" /> : isEditable ? (
                    <button onClick={submitRating} disabled={currentRating === originalRating} className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        Submit Rating
                    </button>
                ) : (
                    <div className="space-y-1">
                        <p className="text-sm text-green-600 dark:text-green-400">Your rating has been submitted!</p>
                        <button onClick={() => setIsEditable(true)} className="text-xs font-semibold text-purple-500 hover:underline">
                            Change Rating
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Rating;