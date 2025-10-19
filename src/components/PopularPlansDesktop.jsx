// src/components/PopularPlansDesktop.jsx
import React from 'react';
import PlanCard from './PlanCard';

const PopularPlansDesktop = ({ popularPlans }) => {
  if (!popularPlans || popularPlans.length === 0) return null;

  // Duplicate list to create seamless scroll
  const loopedPlans = [...popularPlans, ...popularPlans];

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* This wrapper is what moves */}
      <div className="flex w-max animate-scroll-x hover:[animation-play-state:paused]">
        {loopedPlans.map((service, index) => (
          <div
            key={`${service.id}-${index}`}
            className="mx-4 flex-shrink-0"
            style={{ width: "260px" }} // fixes flex collapse bug
          >
            <PlanCard service={service} />
          </div>
        ))}
      </div>

      {/* Fade edges for aesthetics */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white dark:from-slate-900 to-transparent"></div>
      <div className="pointer-events-none absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white dark:from-slate-900 to-transparent"></div>
    </div>
  );
};

export default PopularPlansDesktop;
