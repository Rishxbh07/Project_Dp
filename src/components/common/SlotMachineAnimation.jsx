import React, { useState, useEffect, useRef } from 'react';

const SlotMachineAnimation = ({ words, onAnimationEnd }) => {
  const [currentWord, setCurrentWord] = useState('');
  const finalWord = "Premium Plans";

  useEffect(() => {
    if (!words || words.length === 0) {
      setCurrentWord(finalWord);
      if (onAnimationEnd) onAnimationEnd();
      return;
    }

    // Use each word only once, followed by the final word
    const uniqueWords = [...words, finalWord];
    let currentIndex = 0;
    
    const spin = () => {
      if (currentIndex < uniqueWords.length) {
        setCurrentWord(uniqueWords[currentIndex]);
        
        // Stop the animation at the final word
        if (currentIndex === uniqueWords.length - 1) {
          if (onAnimationEnd) {
            setTimeout(() => onAnimationEnd(), 500);
          }
          return;
        }

        currentIndex++;
        
        // Dynamic timing for a realistic slowdown
        let nextDelay;
        const progress = currentIndex / uniqueWords.length;
        
        if (progress < 0.5) {
          nextDelay = 150; // A steady pace for the first half
        } else if (progress < 0.8) {
          nextDelay = 250; // Start slowing down
        } else {
          nextDelay = 500; // Slow clicks for the final items
        }
        
        setTimeout(spin, nextDelay);
      }
    };

    const startDelay = setTimeout(spin, 100);
    
    return () => {
      clearTimeout(startDelay);
    };
  }, [words, onAnimationEnd]);

  return (
    <div className="relative flex items-center justify-center h-12">
      <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent font-bold text-4xl whitespace-nowrap">
        {currentWord.split('').map((char, index) => (
          <span
            key={`${currentWord}-${index}`}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </div>
  );
};

export default SlotMachineAnimation;