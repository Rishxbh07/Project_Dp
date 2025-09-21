import React, { useState, useEffect } from 'react';
import PlanCard from '../components/PlanCard';
import HostPlanCTA from '../components/HostPlanCTA';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import DapBuddyDropdownMenu from '../components/layout/DapBuddyDropdownMenu';

const HomePage = ({ session }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('services').select('*');
      if (error) console.error('Error fetching services:', error);
      else setServices(data);
      setLoading(false);
    };
    fetchServices();
  }, []);

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 min-h-screen font-sans text-slate-800 dark:text-white relative overflow-hidden">
      {/* Animated background elements for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-20"></div>
      </div>
      
      {/* Main content with proper z-index */}
      <div className="relative z-10">
        <div className="max-w-md mx-auto px-4">
          
          {/* --- THIS IS THE FIX for the layering issue --- */}
          <div className="relative z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-lg my-6 px-4 py-2 rounded-full">
            <DapBuddyDropdownMenu session={session} />
          </div>

          {/* Hero section with modern typography and micro-interactions */}
          <div className="text-center mb-8 px-4">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Share & Save on
                <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
                  Premium Plans
                </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-light">
                Split costs, multiply savings with friends
              </p>
            </div>
            
            {/* Enhanced stats cards with hover effects */}
            <div className="flex justify-center gap-3 mt-6">
              {[
                { value: "2.5K+", label: "Active Users", color: "from-purple-500/20 to-purple-600/20" },
                { value: "₹50K+", label: "Saved Monthly", color: "from-blue-500/20 to-blue-600/20" },
                { value: "98%", label: "Satisfaction", color: "from-green-500/20 to-green-600/20" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={`bg-white dark:bg-gradient-to-br ${stat.color} backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-2xl px-4 py-3 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10`}
                >
                  <div className="text-slate-800 dark:text-white font-bold text-lg">{stat.value}</div>
                  <div className="text-slate-500 dark:text-slate-300 text-xs font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Popular Plans section */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 dark:text-white text-3xl font-bold">
                Popular Plans
                <span className="block w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mt-2 rounded-full"></span>
              </h2>
              <Link to="/marketplace" className="text-purple-500 dark:text-purple-300 text-sm font-semibold hover:text-purple-600 dark:hover:text-purple-200 transition-colors">
                View All
              </Link>
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {loading ? (
                // Enhanced loading skeletons
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[240px] h-[320px] bg-gray-200 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-3xl p-6 animate-pulse">
                    <div className="w-24 h-24 bg-gray-300 dark:bg-white/10 rounded-2xl mb-4 mx-auto"></div>
                    <div className="h-6 bg-gray-300 dark:bg-white/10 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 dark:bg-white/10 rounded mb-3"></div>
                    <div className="h-6 bg-gray-300 dark:bg-white/10 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-white/10 rounded"></div>
                  </div>
                ))
              ) : (
                services.map((service) => (
                  <PlanCard key={service.id} service={service} />
                ))
              )}
            </div>
          </section>

          <HostPlanCTA />
          
          {/* Extra spacing for bottom navigation */}
          <div className="h-24"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;