import React, { useState, useEffect } from 'react';
import PlanCard from '../components/PlanCard';
import SearchBar from '../components/SearchBar';
import CategoryFilters from '../components/CategoryFilters';
import HostPlanCTA from '../components/HostPlanCTA';
import { supabase } from '../lib/supabaseClient';
import DapBuddyDropdownMenu from '../components/layout/DapBuddyDropdownMenu'; // <-- IMPORT

const HomePage = ({ session }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (fetch logic is the same)
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
    <div className="bg-[#0f172a] min-h-screen font-sans">
      <div className="max-w-md mx-auto p-4">

        {/* RENDER YOUR NEW HEADER HERE */}
        <DapBuddyDropdownMenu session={session} />

        <SearchBar />
        <CategoryFilters />

        <section className="mt-8">
          <h2 className="text-white text-3xl font-bold mb-4">Popular Plans</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {loading ? (
              <p className="text-white">Loading...</p>
            ) : (
              services.map((service) => (
                <PlanCard key={service.id} service={service} />
              ))
            )}
          </div>
        </section>

        <HostPlanCTA />
      </div>
    </div>
  );
};

export default HomePage;