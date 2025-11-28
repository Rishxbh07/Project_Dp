import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, BadgeCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ReviewCard = ({ review, session, onInteraction }) => {
  const isMyReview = session?.user?.id === review.user_id;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReaction = async (type) => {
    if (!session) return alert("Please login to react.");
    
    // Optimistic UI update (managed by parent refresh, but we prevent spamming here)
    if (review.user_reaction === type) {
      await supabase.from('review_reactions').delete()
        .eq('review_id', review.review_id)
        .eq('user_id', session.user.id);
    } else {
      await supabase.from('review_reactions').upsert({
        review_id: review.review_id,
        user_id: session.user.id,
        reaction_type: type
      }, { onConflict: 'review_id, user_id' });
    }
    onInteraction(); 
  };

  // Tag Styles - Fully adaptive now
  const getTagStyle = () => {
    if (review.activity_type === 'host') return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30";
    if (review.activity_type === 'member') return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30";
    return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10";
  };

  // Truncation Logic
  const MAX_LENGTH = 150;
  const shouldTruncate = review.comment && review.comment.length > MAX_LENGTH;
  const displayComment = isExpanded || !shouldTruncate 
    ? review.comment 
    : `${review.comment.slice(0, MAX_LENGTH)}...`;

  return (
    <div className="relative min-w-[300px] md:min-w-[360px] max-w-[360px] p-6 rounded-3xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-300 flex flex-col h-full group shadow-sm hover:shadow-md">
      
      {/* Status Badge for Author */}
      {isMyReview && review.status !== 'approved' && (
        <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-500 dark:text-black shadow-sm border border-yellow-200 dark:border-transparent z-10">
          {review.status === 'under_review' ? 'Under Review' : 'Rejected'}
        </div>
      )}

      {/* Top: Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-5 h-5 ${i < Math.round(review.average_rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-slate-600'}`} 
          />
        ))}
      </div>

      {/* Comment */}
      <div className="flex-grow mb-6">
        <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
          "{displayComment}"
        </p>
        {shouldTruncate && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1 hover:underline focus:outline-none"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Footer: User Info */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/10 flex items-center gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {review.pfp_url ? (
            <img src={review.pfp_url} alt={review.username} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-white/10" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-300 font-bold">
              {review.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-gray-900 dark:text-white font-bold text-sm truncate">
              {review.username}
            </p>
            {/* Replaced Crown with Verified Tick */}
            {review.is_featured && (
              <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 dark:fill-blue-500/20" />
            )}
          </div>
          {review.activity_tag && (
            <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border mt-1 ${getTagStyle()}`}>
              {review.activity_tag}
            </div>
          )}
        </div>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-4 mt-4 pt-2">
        <button 
          onClick={() => handleReaction('like')}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${review.user_reaction === 'like' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
        >
          <ThumbsUp className={`w-4 h-4 ${review.user_reaction === 'like' ? 'fill-current' : ''}`} /> {review.likes_count || 0}
        </button>
        <button 
          onClick={() => handleReaction('dislike')}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${review.user_reaction === 'dislike' ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
        >
          <ThumbsDown className={`w-4 h-4 ${review.user_reaction === 'dislike' ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;