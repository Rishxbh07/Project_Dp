import React, { useState, useEffect } from 'react';

const SlotMachineAnimation = ({ words, onAnimationEnd }) => {
  const [currentWord, setCurrentWord] = useState('');
  const finalWord = "Premium Plans";

  useEffect(() => {
    // ... useEffect logic remains the same ...
    if (!words || words.length === 0) {
      setCurrentWord(finalWord);
      if (onAnimationEnd) onAnimationEnd();
      return;
    }

    const animationSequence = [...words, finalWord];
    let currentIndex = 0;
    let timeoutId = null;

    const spin = () => {
      if (currentIndex < animationSequence.length) {
        setCurrentWord(animationSequence[currentIndex]);

        if (currentIndex === animationSequence.length - 1) {
          if (onAnimationEnd) {
            timeoutId = setTimeout(() => onAnimationEnd(), 600);
          }
          return;
        }

        currentIndex++;

        let nextDelay;
        const progress = currentIndex / animationSequence.length;

        if (progress < 0.4) {
          nextDelay = 120;
        } else if (progress < 0.7) {
          nextDelay = 200;
        } else if (progress < 0.9) {
          nextDelay = 350;
        } else {
          nextDelay = 550;
        }

        timeoutId = setTimeout(spin, nextDelay);
      }
    };

    const startDelay = setTimeout(spin, 150);

    return () => {
      clearTimeout(startDelay);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [words, onAnimationEnd]);

  return (
    // --- CONTAINER ---
    // Remains inline-block, vertically aligned, with min-height/width
    <div className="
      relative inline-block align-middle text-left 
      min-h-[1.2em] /* Match surrounding line height */
      min-w-[200px] sm:min-w-[300px] lg:min-w-[400px] xl:min-w-[500px] /* Prevent shrinking */
      overflow-hidden /* Hide overflow */
    ">
      {/* --- INNER SPAN --- */}
      {/* Still inline-block, but alignment is handled by parent's text-left */}
      <span
        className="
          inline-block /* Takes space */
          bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent font-bold
          whitespace-nowrap /* Keep on one line */
          transition-opacity duration-100 ease-in-out
        "
        key={currentWord}
        style={{ opacity: 1 }}
      >
        {currentWord.split('').map((char, index) => (
          <span key={`${currentWord}-${index}`} className="inline-block">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
      {/* --- END INNER SPAN --- */}
    </div>
    // --- END CONTAINER ---
  );
};

export default SlotMachineAnimation;