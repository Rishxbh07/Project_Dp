import React from 'react';
import { useParams, Link } from 'react-router-dom'; // Import hooks for URL data and links

const MarketplacePage = () => {
  // Get the service name from the URL (e.g., "spotify")
  const { serviceName } = useParams();

  // Capitalize the first letter for the title
  const pageTitle = serviceName ? serviceName.charAt(0).toUpperCase() + serviceName.slice(1) : 'Marketplace';

  return (
    <div className="bg-[#0f172a] min-h-screen font-sans text-white">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <header className="flex items-center p-4 border-b border-slate-700">
          <Link to="/" className="text-2xl font-bold mr-4 hover:text-purple-400 transition-colors">
            &larr;
          </Link>
          <h1 className="text-xl font-bold">{pageTitle} Plans</h1>
        </header>

        <main className="p-4">
          {/* Tabs for "dapBuddy plan" and "Community Plans" */}
          <div className="flex border-b border-slate-700 mb-4">
            <button className="flex-1 py-3 text-sm font-semibold text-slate-400 border-b-2 border-transparent">
              dapBuddy plan
            </button>
            <button className="flex-1 py-3 text-sm font-semibold text-purple-400 border-b-2 border-purple-400">
              Community Plans
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="font-bold text-lg">0</div>
              <div className="text-xs text-slate-400">Active Plans</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="font-bold text-lg">₹0</div>
              <div className="text-xs text-slate-400">Avg. Price</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="font-bold text-lg">0.0 ★</div>
              <div className="text-xs text-slate-400">Top Rated</div>
            </div>
          </div>

          {/* Placeholder for listings */}
          <div>
            <p className="text-center text-slate-400 mt-8">Listings will be displayed here...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketplacePage;