// src/components/common/OptionalLoginPopup.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Search,
  Users,
  CheckCircle,
  Music,
  Clapperboard,
  Gamepad2,
  BookOpen,
  Cloud,
  Paintbrush,
  Briefcase,
  Star,
} from 'lucide-react';
import logo from '/assets/icons/Logo.png'; // Make sure this path is correct

const slideData = [
  {
    id: 'discover',
    mainIcon: Search,
    title: 'Discover & Browse Groups',
    description: 'Explore shared plans for all your favorite services — from streaming to productivity tools.',
    smallIcons: [Music, Clapperboard, Gamepad2, BookOpen, Cloud, Paintbrush, Briefcase],
    gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500',
    gradientText: 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500', // Gradient for text
  },
  {
    id: 'choose',
    mainIcon: Users,
    title: 'Choose the Best Group',
    description: 'Join communities with trusted hosts. Ratings, badges, and vibes — all in one glance.',
    smallIcons: [Star],
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    gradientText: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600', // Gradient for text
  },
  {
    id: 'join',
    mainIcon: CheckCircle,
    title: 'Join, Save, and Enjoy!',
    description: 'Access premium plans instantly. Save big and experience together — smarter sharing starts here.',
    smallIcons: [],
    gradient: 'from-emerald-400 via-green-500 to-teal-500',
    gradientText: 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500', // Gradient for text
  },
];

const OptionalLoginPopup = ({ isOpen, onClose, onAuthClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const slideContainerRef = useRef(null);

  // Swipe Gesture State
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const swipeThreshold = 50;

  // Slide Navigation with animation lock
  const changeSlide = useCallback((newIndex) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(newIndex);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    changeSlide((currentSlide + 1) % slideData.length);
  }, [currentSlide, changeSlide]);

  const prevSlide = useCallback(() => {
    changeSlide((currentSlide - 1 + slideData.length) % slideData.length);
  }, [currentSlide, changeSlide]);

  // Auto-advance slides effect
  useEffect(() => {
    let slideInterval;
    if (isOpen) {
      slideInterval = setInterval(() => {
        if (!isAnimating) {
            nextSlide();
        }
      }, 5000);
    }
    return () => clearInterval(slideInterval);
  }, [isOpen, nextSlide, isAnimating]);

  // Swipe Handlers
  const handleTouchStart = (e) => {
     if (isAnimating) return;
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
     if (isAnimating) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
     if (isAnimating) return;
    const distance = touchStart - touchEnd;
    if (distance > swipeThreshold) {
      nextSlide();
    } else if (distance < -swipeThreshold) {
      prevSlide();
    }
     setTouchStart(0);
     setTouchEnd(0);
  };


  if (!isOpen) return null;

  // Zain font style object, adapted for dynamic gradient
  const titleStyle = (gradientClass) => ({
      fontFamily: "'Zain', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      fontWeight: 800,
      fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', // Slightly smaller max size
      lineHeight: 1.2, // Adjusted line height
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.02em',
      display: 'inline-block', // To make bg-gradient work
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[60] p-0 sm:p-6 animate-in fade-in duration-80">
      <div className="relative w-full h-full sm:h-auto sm:max-w-4xl bg-white/95 dark:bg-slate-900/95 rounded-none sm:rounded-3xl shadow-none sm:shadow-[0_0_100px_-10px_rgba(147,51,234,0.5)] border-none sm:border sm:border-white/30 dark:sm:border-slate-700/50 overflow-hidden flex flex-col scale-100 transition-all duration-300">
        
        <button onClick={onClose} className="absolute right-4 top-4 sm:right-5 sm:top-5 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors z-[70]">
          <X className="w-6 h-6 text-gray-600 dark:text-slate-300" />
        </button>

        <div 
          className="flex-grow flex flex-col items-center justify-between text-center relative w-full overflow-hidden pt-12 pb-24 sm:pb-8 sm:pt-12" // Adjusted padding
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slider Container */}
          <div 
            ref={slideContainerRef}
            className="flex w-full h-full transition-transform duration-500 ease-in-out" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slideData.map((slide) => (
              <div 
                key={slide.id} 
                className="w-full flex-shrink-0 flex flex-col items-center justify-center px-6 sm:px-12" // Added justify-center
              >
                {/* Icon Area */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-10 sm:mb-12"> {/* Increased bottom margin */}
                  
                  {/* Slide 1: Discover Icons */}
                  {slide.id === 'discover' && (
                    <div className="absolute inset-0 animate-spin-slow z-0">
                      {slide.smallIcons.map((Icon, i) => {
                        const angle = (i * 360) / slide.smallIcons.length;
                        const radius = 9;
                        const x = Math.cos((angle * Math.PI) / 180) * radius;
                        const y = Math.sin((angle * Math.PI) / 180) * radius;
                        return (
                          <div
                            key={i}
                            className="absolute w-14 h-14 sm:w-16 sm:h-16 bg-white/80 dark:bg-slate-800/80 rounded-full flex items-center justify-center shadow-md backdrop-blur-md animate-spin-slow-reverse"
                            style={{
                              top: `calc(50% + ${y}rem - 1.75rem)`,
                              left: `calc(50% + ${x}rem - 1.75rem)`,
                            }}
                          >
                            <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-300" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Slide 2: Choose Icons */}
                  {slide.id === 'choose' && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 animate-in fade-in zoom-in-90 duration-700">
                      <div className={`w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br ${slide.gradient} rounded-full flex items-center justify-center shadow-lg relative`}>
                        <slide.mainIcon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                        <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md animate-in fade-in zoom-in-50 delay-300 duration-500">
                          <Star className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Icon (Discover & Join) */}
                  {(slide.id === 'discover' || slide.id === 'join') && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 animate-in fade-in zoom-in-90 duration-700">
                      <div
                        className={`w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br ${slide.gradient} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <slide.mainIcon className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Text Area (Moved further down, Zain font for title) */}
                <div className="relative z-30 w-full max-w-md mt-4"> {/* Added margin-top */}
                  <h2 
                    style={titleStyle(slide.gradientText)} 
                    className={`mb-3 sm:mb-4 select-none ${slide.gradientText}`} // Apply gradient class
                  >
                    {slide.title}
                  </h2>
                  <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed"> {/* Slightly smaller text */}
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots (Moved down, smaller) */}
          <div className="flex justify-center gap-2 mt-auto pt-6 z-40">
            {slideData.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => changeSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${ // Even smaller dots
                  currentSlide === i
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 scale-125 w-4' // Active dot wider
                    : 'bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons Footer (Shrunk & Mobile Layout Changed - like black screenshot) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex flex-row justify-between items-center gap-3 z-50 
                     sm:relative sm:p-6 sm:bg-gradient-to-r sm:from-purple-50 sm:to-indigo-50 dark:sm:from-slate-900 dark:sm:to-slate-900 sm:justify-center sm:gap-6">
          <button
            onClick={onClose}
            className="flex-1 text-center sm:flex-none sm:w-auto text-gray-600 dark:text-slate-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all sm:order-1" // Mobile: left side
          >
            Browse
          </button>
          <button
            onClick={onAuthClick}
            className="flex-1 text-center sm:flex-none sm:w-auto text-gray-600 dark:text-slate-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all sm:order-1" // Mobile: right side
          >
            Sign In
          </button>
        </div>
      </div>

      {/* CSS for spin animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 18s linear infinite;
        }
        
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 18s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OptionalLoginPopup;