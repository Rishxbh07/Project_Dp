import React from 'react';
import { Sparkles, Crown, Flame, Zap, Star, Baby } from 'lucide-react';

const AgeBadge = ({ createdAt, className = "" }) => {
    const getBadgeDetails = (createdAt) => {
        if (!createdAt) return null;
        
        const now = new Date();
        const startDate = new Date(createdAt);
        const diffTime = Math.abs(now - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            return {
                text: 'Newborn',
                icon: Baby,
                gradient: 'from-cyan-400 via-blue-400 to-cyan-500',
                textColor: 'text-white',
                glow: false,
                pulse: true,
                shimmer: false
            };
        }
        if (diffDays <= 30) {
            return {
                text: 'Toddler',
                icon: Sparkles,
                gradient: 'from-green-400 via-emerald-400 to-green-500',
                textColor: 'text-white',
                glow: false,
                pulse: false,
                shimmer: true
            };
        }
        if (diffDays <= 90) {
            return {
                text: 'Teen',
                icon: Zap,
                gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
                textColor: 'text-white',
                glow: false,
                pulse: false,
                shimmer: true
            };
        }
        if (diffDays <= 180) {
            return {
                text: 'Adult',
                icon: Star,
                gradient: 'from-orange-400 via-red-400 to-orange-500',
                textColor: 'text-white',
                glow: false,
                pulse: false,
                shimmer: true
            };
        }
        if (diffDays <= 365) {
            return {
                text: 'Legend',
                icon: Flame,
                gradient: 'from-red-500 via-pink-500 to-red-600',
                textColor: 'text-white',
                glow: true,
                pulse: false,
                shimmer: true
            };
        }
        return {
            text: 'Legendary',
            icon: Crown,
            gradient: 'from-amber-300 via-yellow-400 to-amber-500',
            textColor: 'text-amber-900',
            glow: true,
            pulse: true,
            shimmer: true,
            legendary: true
        };
    };

    const badge = getBadgeDetails(createdAt);
    
    if (!badge) return null;

    const IconComponent = badge.icon;

    return (
        <div className={`absolute top-0 -translate-y-1/2 left-4 z-20 ${className}`}>
            {/* Legendary background glow effect */}
            {badge.legendary && (
                <>
                    {/* Main golden glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-amber-200/30 via-yellow-300/40 to-amber-200/30 rounded-2xl blur-xl animate-pulse"></div>
                    {/* Secondary glow ring */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-300/40 via-yellow-400/50 to-amber-300/40 rounded-xl blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    {/* Treasure box shimmer */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent rounded-lg animate-ping" style={{ animationDuration: '3s' }}></div>
                </>
            )}
            
            {/* Regular glow for Legend tier */}
            {badge.glow && !badge.legendary && (
                <div className="absolute -inset-1 bg-gradient-to-r from-red-400/50 via-pink-400/60 to-red-400/50 rounded-lg blur opacity-75 animate-pulse"></div>
            )}
            
            {/* Main badge container */}
            <div className={`
                relative px-3 py-1.5 text-xs font-bold rounded-lg shadow-lg
                bg-gradient-to-r ${badge.gradient} ${badge.textColor}
                transform transition-all duration-300 hover:scale-110
                ${badge.pulse ? 'animate-pulse' : ''}
                ${badge.shimmer ? 'overflow-hidden' : ''}
                border border-white/20
            `}>
                {/* Shimmer effect overlay */}
                {badge.shimmer && (
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                )}
                
                {/* Badge content */}
                <div className="relative flex items-center gap-1.5">
                    <IconComponent className="w-3 h-3" />
                    <span className="font-extrabold tracking-wide">{badge.text}</span>
                </div>
                
                {/* Legendary sparkle effects */}
                {badge.legendary && (
                    <>
                        <div className="absolute -top-1 -right-1 w-2 h-2">
                            <div className="w-full h-full bg-yellow-200 rounded-full animate-ping"></div>
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5">
                            <div className="w-full h-full bg-amber-200 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AgeBadge;