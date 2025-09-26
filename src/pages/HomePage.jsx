import React, {useState, useEffect} from 'react';
import PlanCard from '../components/PlanCard';
import HostPlanCTA from '../components/HostPlanCTA';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import DapBuddyDropdownMenu from '../components/layout/DapBuddyDropdownMenu';
import SlotMachineAnimation from '../components/common/SlotMachineAnimation';
import { Search, ShieldCheck, Smile } from 'lucide-react';

const HomePage = ({ session }) => {
  const [popularPlans, setPopularPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allServiceNames, setAllServiceNames] = useState([]);
  const [runAnimation, setRunAnimation] = useState(false);

  useEffect(() => {
    // This function fetches all service names for the slot machine animation
    const fetchAllServiceNames = async () => {
      const { data, error } = await supabase.from('services').select('name');
      if (error) {
        console.error('Error fetching all service names:', error);
      } else {
        setAllServiceNames(data.map(s => s.name));
        if (session && !sessionStorage.getItem('hasAnimatedText')) {
          setTimeout(() => setRunAnimation(true), 3500);
        }
      }
    };

    // This is the ONLY function that fetches plan data for the homepage
    const fetchPopularPlans = async () => {
      setLoading(true);
      
      // Fetches exclusively from the 'popular_plans' table.
      const { data, error } = await supabase
        .from('popular_plans')
        .select('*')
        .order('average_rating', { ascending: false });

      if (error) {
        console.error('Error fetching popular plans:', error);
        setPopularPlans([]);
      } else {
        const formattedPlans = data.map(plan => ({
          id: plan.listing_id,
          name: plan.service_name,
          base_price: plan.base_price,
          description: `Join the best ${plan.service_name} plan!`
        }));
        setPopularPlans(formattedPlans);
      }
      setLoading(false);
    };

    fetchPopularPlans();
    fetchAllServiceNames();
  }, [session]);

  // Effect to handle the card carousel animation
  useEffect(() => {
    if (popularPlans.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % popularPlans.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [popularPlans]);

  const handleAnimationEnd = () => {
    sessionStorage.setItem('hasAnimatedText', 'true');
    setRunAnimation(false);
  };

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-slate-800 dark:text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="max-w-md mx-auto px-4">
          <div className="relative z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-lg my-6 px-4 py-2 rounded-full">
            <DapBuddyDropdownMenu session={session} />
          </div>

          <div className="text-center mb-8 px-4">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Share & Save on
                {runAnimation ? (
                  <SlotMachineAnimation
                    words={allServiceNames}
                    onAnimationEnd={handleAnimationEnd}
                  />
                ) : (
                  <span
                    className="block bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-pulse cursor-pointer"
                    onClick={() => setRunAnimation(true)}
                  >
                    Premium Plans
                  </span>
                )}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-light">
                Split costs, multiply savings with friends
              </p>
            </div>
            
            <div className="flex justify-center gap-3 mt-6">
              {[
                { value: "2.5K+", label: "Active Users", color: "purple" },
                { value: "₹50K+", label: "Saved Monthly", color: "blue" },
                { value: "98%", label: "Satisfaction", color: "green" }
              ].map((stat, index) => {
                const colorClassMap = {
                  purple: 'dark:border-t-purple-500/80',
                  blue: 'dark:border-t-blue-500/80',
                  green: 'dark:border-t-green-500/80'
                };
                return (
                    <div 
                      key={index}
                      className={`bg-white dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-x-transparent dark:border-b-transparent ${colorClassMap[stat.color]} rounded-2xl px-4 py-3 transform hover:scale-105 transition-all duration-300`}
                    >
                      <div className="text-slate-800 dark:text-white font-bold text-lg">{stat.value}</div>
                      <div className="text-slate-500 dark:text-slate-200 text-xs font-medium">{stat.label}</div>
                    </div>
                )
              })}
            </div>
          </div>

          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 dark:text-white text-3xl font-bold">
                Popular Plans
                <span className="block w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mt-2 rounded-full"></span>
              </h2>
              <Link to="/explore" className="text-purple-500 dark:text-purple-300 text-sm font-semibold hover:text-purple-600 dark:hover:text-purple-200 transition-colors">
                View All
              </Link>
            </div>
            
            <div className="relative h-[380px] flex items-center justify-center overflow-hidden">
              {loading ? (
                <div className="flex-shrink-0 w-[240px] h-[320px] bg-gray-200 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-3xl p-6 animate-pulse">
                  <div className="w-24 h-24 bg-gray-300 dark:bg-white/10 rounded-2xl mb-4 mx-auto"></div>
                  <div className="h-6 bg-gray-300 dark:bg-white/10 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-white/10 rounded mb-3"></div>
                  <div className="h-6 bg-gray-300 dark:bg-white/10 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-white/10 rounded"></div>
                </div>
              ) : (
                popularPlans.map((service, index) => {
                  let position = 'next';
                  if (index === currentIndex) {
                    position = 'active';
                  } else if (index === (currentIndex - 1 + popularPlans.length) % popularPlans.length) {
                    position = 'prev';
                  } else if (index === (currentIndex + 1) % popularPlans.length) {
                    position = 'next';
                  } else {
                    position = 'hidden';
                  }

                  return (
                    <div key={service.id} className={`plan-card-container ${position}`}>
                      <PlanCard service={service} />
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="my-10 py-10">
            <h2 className="text-slate-900 dark:text-white text-3xl font-bold text-center mb-8">
              How It Works
              <span className="block w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mt-2 rounded-full mx-auto"></span>
            </h2>
            <div className="space-y-8 max-w-sm mx-auto">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">1. Find Your Plan</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Browse or search for any subscription you need from our marketplace.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">2. Join Securely</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Pay safely through our platform. We hold your payment and only release it to the host after your monthly subscription tenure is successfully completed.
                  </p>
                  <Link to="/rules" className="text-sm font-semibold text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 mt-2 inline-block">
                    Know more in details &rarr;
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                  <Smile className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">3. Enjoy & Save</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Enjoy your premium subscription at a fraction of the cost. It's that simple!
                  </p>
                </div>
              </div>
            </div>
          </section>

          <HostPlanCTA />

          <footer className="text-center py-10 border-t border-slate-200 dark:border-white/10 mt-10">
            <div className="flex justify-center gap-6 mb-4">
              <Link to="/about" className="text-sm text-slate-600 dark:text-slate-300 hover:text-purple-500">About Us</Link>
              <Link to="/contact" className="text-sm text-slate-600 dark:text-slate-300 hover:text-purple-500">Contact</Link>
              <Link to="/terms" className="text-sm text-slate-600 dark:text-slate-300 hover:text-purple-500">Terms</Link>
              <Link to="/privacy" className="text-sm text-slate-600 dark:text-slate-300 hover:text-purple-500">Privacy</Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © 2025 DapBuddy. All Rights Reserved.
            </p>
          </footer>
          
          <div className="h-24"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;