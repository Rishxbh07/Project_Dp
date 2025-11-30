import React, { useState } from 'react';
import PlanCard from './PlanCard'; // Make sure the path to PlanCard is correct



const PopularPlansMobile = ({ services = exampleServices }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = services.length;

  // --- Navigation Logic ---
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
  };

  // --- Class Logic ---
  const getPositionClass = (index) => {
    // This calculates each card's position relative to the current one
    const positiveIndex = (index - currentIndex + totalItems) % totalItems;

    switch (positiveIndex) {
      case 0:
        return 'active'; // The card in the center
      case 1:
        return 'next';   // The card waiting on the right
      case totalItems - 1:
        return 'prev';   // The card that was just active, now on the left
      case 2:
        return 'far-next'; // The card entering from the far right
      default:
        return 'far-prev'; // All other cards sliding off to the far left
    }
  };

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* This is the container for the cards */}
      <div className="relative w-full h-full">
        {services.map((service, index) => (
          <div
            key={service.id}
            className={`plan-card-container ${getPositionClass(index)}`}
          >
            <PlanCard service={service} />
          </div>
        ))}
      </div>

      {/* --- Navigation Buttons (for testing) --- */}
      <div className="absolute bottom-0 z-20 flex gap-4">
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PopularPlansMobile;