import React from 'react';
import { Link } from 'react-router-dom'; // <-- 1. IMPORT

const PlanCard = ({ service }) => {
  const { name, description } = service;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // We'll add price and plan counts later
  const minPrice = 45;
  const livePlansCount = 2;

  return (
    // 2. WRAP EVERYTHING IN A LINK
    // The link goes to a URL like "/marketplace/spotify"
    <Link to={`/marketplace/${name.toLowerCase()}`} className="flex-shrink-0 w-[240px] h-[320px] bg-[#1e2947] border border-slate-700 rounded-3xl p-6 flex flex-col items-center text-center text-white shadow-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer">
      <div className="w-24 h-24 bg-green-400 rounded-2xl flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-white rounded-lg text-black font-bold text-4xl flex items-center justify-center">
          {initial}
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1">{name}</h3>
      <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-3">
        from ₹{minPrice}/m
      </p>
      <div className="bg-green-500 text-white text-xs font-bold py-1 px-4 rounded-full mb-3">
        {livePlansCount} Plans Live
      </div>
      <p className="text-slate-400 text-sm">{description}</p>
    </Link>
  );
};

export default PlanCard;