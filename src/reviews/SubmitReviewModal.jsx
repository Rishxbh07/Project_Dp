import React, { useState } from 'react';
// FIXED: Path changed from "../../lib/supabaseClient" to "../lib/supabaseClient"
import { supabase } from '../lib/supabaseClient';
import Modal from '../components/common/Modal';
import { Star, Loader2, AlertTriangle } from 'lucide-react';

const RATING_CATEGORIES = [
    { id: 'rating_ui', label: 'UI & Design', desc: 'Visual appeal, ease of navigation.' },
    { id: 'rating_cx', label: 'Customer Experience', desc: 'Onboarding, clarity, support.' },
    { id: 'rating_reliability', label: 'Service Reliability', desc: 'Uptime, speed, host communication.' },
    { id: 'rating_pricing', label: 'Pricing & Value', desc: 'Cost, transparency, fees.' },
    { id: 'rating_safety', label: 'Moderation & Safety', desc: 'Verification, fraud prevention.' },
];

const SubmitReviewModal = ({ isOpen, onClose, session, onReviewSubmitted }) => {
    const [ratings, setRatings] = useState({
        rating_ui: 0,
        rating_cx: 0,
        rating_reliability: 0,
        rating_pricing: 0,
        rating_safety: 0,
    });
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStarClick = (category, value) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    const handleSubmit = async () => {
        // Validation
        const allRated = Object.values(ratings).every(r => r > 0);
        if (!allRated) return setError('Please rate all 5 categories.');
        if (comment.length < 10) return setError('Please write a helpful comment (min 10 chars).');

        setLoading(true);
        setError('');

        try {
            const { error: dbError } = await supabase.from('platform_reviews').insert({
                user_id: session.user.id,
                ...ratings,
                comment: comment.trim()
            });

            if (dbError) {
                if (dbError.code === '23505') throw new Error("You have already submitted a review.");
                throw dbError;
            }

            onReviewSubmitted();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const average = (Object.values(ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rate DapBuddy</h2>
                <p className="text-sm text-gray-500">Your feedback helps us improve the platform.</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-2">
                {RATING_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="mb-4 text-left bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{cat.label}</span>
                            <span className="text-xs font-bold text-purple-500">{ratings[cat.id] > 0 ? ratings[cat.id] : '-'} / 5</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{cat.desc}</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleStarClick(cat.id, star)}
                                    className="focus:outline-none transition-transform active:scale-90"
                                >
                                    <Star 
                                        className={`w-6 h-6 ${ratings[cat.id] >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
                    <div className="flex justify-between items-center mb-4">
                         <label className="text-sm font-bold text-gray-900 dark:text-white">Overall Rating</label>
                         <div className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                             <Star className="w-4 h-4 fill-current" /> {average}
                         </div>
                    </div>

                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-2 text-left">
                        Your Review ({comment.length}/200)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={200}
                        placeholder="Example: DapBuddy is a secure and affordable subscription-sharing platform..."
                        className="w-full p-3 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        rows={3}
                    />
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="mt-6">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                </button>
            </div>
        </Modal>
    );
};

export default SubmitReviewModal;