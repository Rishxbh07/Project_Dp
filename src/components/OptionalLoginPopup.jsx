import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
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
import logo from '/assets/icons/Logo.png';

const slideData = [
  {
    mainIcon: Search,
    title: 'Discover & Browse Groups',
    description: 'Explore shared plans for all your favorite services.',
    smallIcons: [Music, Clapperboard, Gamepad2, BookOpen, Cloud, Paintbrush, Briefcase],
  },
  {
    mainIcon: Users,
    title: 'Choose the Best Group',
    description: 'Join groups hosted by top-rated community members. Look for high ratings and plan badges!',
    smallIcons: [Star, Star, Star, Star, Star],
  },
  {
    mainIcon: CheckCircle,
    title: 'Join, Save, and Enjoy!',
    description: 'Securely join a plan, get instant access, and enjoy premium features for a fraction of the cost.',
    smallIcons: [],
  },
];

const OptionalLoginPopup = ({ isOpen, onClose, onAuthClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideData.length) % slideData.length);
  };

  useEffect(() => {
    if (isOpen) {
      const slideInterval = setInterval(() => {
        nextSlide();
      }, 5000); // Auto-advance every 5 seconds
      return () => clearInterval(slideInterval);
    }
  }, [isOpen, currentSlide]);

  if (!isOpen) {
    return null;
  }

  const slide = slideData[currentSlide];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
      <div className="relative bg-white dark:bg-slate-900/95 w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
        <div className="p-6 flex-grow flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 mb-6">
            {slide.smallIcons.map((Icon, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center"
                style={{
                  transform: `rotate(${i * (360 / slide.smallIcons.length)}deg) translate(5rem) rotate(-${i * (360 / slide.smallIcons.length)}deg)`,
                  animation: `icon-fade-in 0.5s ease-out ${i * 0.1}s both`,
                }}
              >
                <Icon className="w-4 h-4 text-purple-600 dark:text-purple-300" />
              </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                key={currentSlide}
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-in fade-in zoom-in-90 duration-500"
              >
                <slide.mainIcon className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <div key={currentSlide} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{slide.title}</h2>
            <p className="text-gray-600 dark:text-slate-300 text-sm max-w-xs mx-auto">{slide.description}</p>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {slideData.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-purple-500 scale-125' : 'bg-gray-300 dark:bg-slate-600'}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-slate-200" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-slate-200" />
          </button>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 space-y-3">
          <button
            onClick={onAuthClick}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 px-8 rounded-xl transition-transform transform hover:scale-[1.02]"
          >
            Sign In & Join
          </button>
          <button
            onClick={onClose}
            className="w-full bg-transparent text-gray-600 dark:text-slate-300 font-semibold py-3 px-8 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
          >
            Browse as Guest
          </button>
        </div>
      </div>
      <style>{`
        @keyframes icon-fade-in {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default OptionalLoginPopup;