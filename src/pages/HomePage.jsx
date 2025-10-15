import React, { useState, useEffect } from 'react';
import PlanCard from '../components/PlanCard';
import HostPlanCTA from '../components/HostPlanCTA';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import DapBuddyDropdownMenu from '../components/layout/DapBuddyDropdownMenu';
import SlotMachineAnimation from '../components/common/SlotMachineAnimation';
import { YoutubeIcon, InstagramIcon, TwitterIcon, GlobeIcon } from 'lucide-react';
import HowItWorks from '../components/HowItWorks';
import StarBorder from '../components/common/StarBorder';

const HomePage = ({ session }) => {
  const [popularPlans, setPopularPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allServiceNames, setAllServiceNames] = useState([]);
  const [runAnimation, setRunAnimation] = useState(false);

  useEffect(() => {
    const fetchAllServiceNames = async () => {
      const { data, error } = await supabase.from('services').select('name');
      if (error) console.error('Error fetching all service names:', error);
      else {
        setAllServiceNames(data.map(s => s.name));
        if (session && !sessionStorage.getItem('hasAnimatedText')) {
          setTimeout(() => setRunAnimation(true), 3500);
        }
      }
    };

    const fetchPopularPlans = async () => {
      try {
        const cachedPlans = localStorage.getItem('popularPlansCache');
        const cachedTimestamp = localStorage.getItem('popularPlansTimestamp');
        const sixHours = 6 * 60 * 60 * 1000;

        if (cachedPlans && cachedTimestamp && Date.now() - cachedTimestamp < sixHours) {
          setPopularPlans(JSON.parse(cachedPlans));
          setLoading(false);
          return;
        }

        setLoading(true);
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
          localStorage.setItem('popularPlansCache', JSON.stringify(formattedPlans));
          localStorage.setItem('popularPlansTimestamp', Date.now());
        }
      } catch (error) {
        console.error('Unexpected error fetching popular plans:', error);
        setPopularPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPlans();
    fetchAllServiceNames();
  }, [session]);

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

  const glowMap = {
    purple: '#8747d1',
  };

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-slate-800 dark:text-white relative overflow-hidden">
      
      <DapBuddyDropdownMenu session={session} />
      
      <div className="relative z-10">
        <div className="max-w-md mx-auto px-4 lg:max-w-7xl">

          {/* Hero Section */}
          <div className="text-center mb-8 px-4 lg:flex lg:text-left lg:items-center lg:py-16">
            <div className="mb-6 lg:w-1/2 lg:pr-16">
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
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
              <p className="text-slate-600 dark:text-slate-300 text-lg lg:text-xl font-light">
                Split costs, multiply savings with friends
              </p>
            </div>

            {/* Stats Section */}
            <div className="flex justify-center gap-3 mt-6 lg:w-1/2 lg:grid lg:grid-cols-3 lg:gap-4">
              {[
                { value: "2.5K+", label: "Active Users", color: "purple" },
                { value: "₹50K+", label: "Saved Monthly", color: "blue" },
                { value: "98%", label: "Satisfaction", color: "green" },
                { value: "20+", label: "Services", color: "sky", desktopOnly: true },
                { value: "500+", label: "Groups Hosted", color: "amber", desktopOnly: true },
                { value: "80%", label: "Avg. Savings", color: "rose", desktopOnly: true },
              ].map((stat, index) => (
                <StarBorder
                  key={index}
                  color={glowMap[stat.color]}
                  speed="8s"
                  thickness={2}
                  as="div"
                  className={`${stat.desktopOnly ? 'hidden lg:flex' : 'flex'} flex-1 lg:flex-auto flex-col justify-center text-center rounded-2xl px-4 py-3 lg:py-6 transform hover:scale-105 transition-all duration-300 ease-out`}
                >
                  <div className="text-slate-800 dark:text-white font-bold text-lg lg:text-2xl">{stat.value}</div>
                  <div className="text-slate-500 dark:text-slate-200 text-xs lg:text-sm font-medium">{stat.label}</div>
                </StarBorder>
              ))}
            </div>
          </div>

          {/* Popular Plans Section */}
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

            {loading ? (
              <div className="flex justify-center">
                <div className="flex-shrink-0 w-[240px] h-[320px] bg-gray-200 dark:bg-white/5 rounded-3xl p-6 animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="relative h-[380px] flex items-center justify-center overflow-hidden lg:hidden">
                  {popularPlans.map((service, index) => {
                    let position = 'next';
                    if (index === currentIndex) position = 'active';
                    else if (index === (currentIndex - 1 + popularPlans.length) % popularPlans.length) position = 'prev';
                    else if (index === (currentIndex + 1) % popularPlans.length) position = 'next';
                    else position = 'hidden';

                    return (
                      <div key={service.id} className={`plan-card-container ${position}`}>
                        <PlanCard service={service} />
                      </div>
                    );
                  })}
                </div>

                <div className="hidden lg:flex flex-wrap justify-center gap-8">
                  {popularPlans.slice(0, 4).map((service) => (
                    <PlanCard key={service.id} service={service} />
                  ))}
                </div>
              </>
            )}
          </section>

          <HowItWorks />
          <HostPlanCTA />

          {/* Footer */}
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

            <div className="flex justify-center gap-8 my-8">
              <a href="#" className="text-slate-500 hover:text-purple-500 dark:text-slate-400 dark:hover:text-purple-400 transition-colors">
                <YoutubeIcon className="w-6 h-6" />
              </a>
              <a href="#" className="text-slate-500 hover:text-purple-500 dark:text-slate-400 dark:hover:text-purple-400 transition-colors">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href="#" className="text-slate-500 hover:text-purple-500 dark:text-slate-400 dark:hover:text-purple-400 transition-colors">
                <GlobeIcon className="w-6 h-6" />
              </a>
              <a href="#" className="text-slate-500 hover:text-purple-500 dark:text-slate-400 dark:hover:text-purple-400 transition-colors">
                <TwitterIcon className="w-6 h-6" />
              </a>
            </div>
          </footer>

          <div className="h-24"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
