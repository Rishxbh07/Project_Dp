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
import PopularPlansDesktop from '../components/PopularPlansDesktop';
import FAQSection from '../components/FAQSection'; 
import Footer from '../components/layout/Footer';

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
    blue: '#3b82f6',
    green: '#22c55e',
    sky: '#0ea5e9',
    amber: '#f59e0b',
    rose: '#f43f5e',
  };

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-slate-800 dark:text-white relative overflow-hidden">
      
      <DapBuddyDropdownMenu session={session} />
      
      <div className="relative z-10">
        <div className="w-full px-6 lg:px-12">

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
            <div className="grid grid-cols-3 gap-3 mt-6 lg:w-1/2 lg:gap-4">
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
                  className={`${stat.desktopOnly ? 'hidden lg:flex' : 'flex'} h-full flex-col justify-center text-center transform hover:-translate-y-1.5 transition-transform duration-300 ease-out`}
                  innerClassName="px-4 py-5 lg:py-6"
                >
                  <div className="text-slate-800 dark:text-white font-bold text-xl lg:text-3xl">{stat.value}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm lg:text-base font-medium mt-1">{stat.label}</div>
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
                {/* --- MOBILE CAROUSEL --- */}
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

                {/* --- DESKTOP INFINITE SCROLL --- */}
                <div className="hidden lg:block">
                    <PopularPlansDesktop popularPlans={popularPlans} />
                </div>
              </>
            )}
          </section>
          <HowItWorks />
          <HostPlanCTA />
          <FAQSection/>
          <Footer />

          <div className="h-24"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;