import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ReviewCard from './ReviewCard';
import SubmitReviewModal from './SubmitReviewModal';
import { MessageSquarePlus, Star } from 'lucide-react';

const PlatformReviews = ({ session, openAuthModal }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_platform_reviews', {
            p_viewer_id: session?.user?.id || null
        });

        if (error) throw error;
        setReviews(data || []);
        
        if (session) {
            const myReview = data.find(r => r.user_id === session.user.id);
            setHasUserReviewed(!!myReview);
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [session, refreshTrigger]);

  const handleWriteReview = () => {
    if (!session) {
      openAuthModal();
    } else {
      setIsModalOpen(true);
    }
  };

  if (loading && reviews.length === 0) return null; // Or a skeleton loader

  return (
    <section className="py-16 relative overflow-hidden">
        {/* Background decorative elements - Adapted for Light/Dark */}
        {/* Removed fixed bg-[#0b1220] to let parent background show, or use theme aware bg */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">Trusted by Community</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        What our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400" style={{ fontFamily: "'Zain', sans-serif", fontWeight: 800, fontSize: '1.2em' }}>βuddies</span> say
                    </h2>
                </div>
                
                {!hasUserReviewed && (
                    <button 
                        onClick={handleWriteReview}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white px-5 py-3 rounded-full font-semibold transition-all border border-gray-200 dark:border-white/10 hover:border-purple-500/50 backdrop-blur-sm shadow-sm"
                    >
                        <MessageSquarePlus className="w-5 h-5" />
                        Write a Review
                    </button>
                )}
            </div>

            {/* Review Carousel / Scroll */}
            {/* Uses flex-nowrap and overflow-x-auto for horizontal scroll */}
            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 gap-6 snap-x snap-mandatory scrollbar-hide">
                {reviews.map((review) => (
                    <div key={review.review_id} className="snap-center">
                        <ReviewCard 
                            review={review} 
                            session={session}
                            onInteraction={() => setRefreshTrigger(prev => prev + 1)} 
                        />
                    </div>
                ))}
                
                {/* "End of list" card */}
                {reviews.length > 0 && (
                     <div className="min-w-[200px] flex flex-col items-center justify-center text-center p-6 rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                        <p className="mb-4 font-medium">Join {reviews.length}+ others</p>
                        {!hasUserReviewed && (
                            <button onClick={handleWriteReview} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-bold underline">
                                Add your review
                            </button>
                        )}
                     </div>
                )}
            </div>
        </div>

        {session && (
            <SubmitReviewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                session={session}
                onReviewSubmitted={() => setRefreshTrigger(prev => prev + 1)}
            />
        )}
    </section>
  );
};

export default PlatformReviews;