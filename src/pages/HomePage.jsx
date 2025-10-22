// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import PlanCard from '../components/PlanCard';
import HostPlanCTA from '../components/HostPlanCTA'; 
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import TopNavBar from '../components/layout/TopNavBar';
import SlotMachineAnimation from '../components/common/SlotMachineAnimation';
import HowItWorks from '../components/HowItWorks';
import StarBorder from '../components/common/StarBorder';
import PopularPlansDesktop from '../components/PopularPlansDesktop';
import PopularPlansMobile from '../components/PopularPlansMobile';
import FAQSection from '../components/FAQSection';
import Footer from '../components/layout/Footer';

// --- (Step 1: Import the new component) ---
import OptionalLoginPopup from '../components/common/OptionalLoginPopup'; // Assuming you saved it here

// --- (Step 2: Receive openAuthModal prop) ---
const HomePage = ({ session, openAuthModal }) => {
  const [popularPlans, setPopularPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allServiceNames, setAllServiceNames] = useState([]);
  const [runAnimation, setRunAnimation] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  
  // --- (Step 3: Add state for the new popup) ---
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    // ... (Your existing fetchAllServiceNames and fetchPopularPlans logic) ...
    const fetchAllServiceNames = async () => {
      setLoadingServices(true);
      try {
        const cachedNames = localStorage.getItem('serviceNamesCache');
        const cachedTimestamp = localStorage.getItem('serviceNamesTimestamp');
        const sixDays = 6 * 24 * 60 * 60 * 1000;

        if (cachedNames && cachedTimestamp && Date.now() - cachedTimestamp < sixDays) {
          setAllServiceNames(JSON.parse(cachedNames));
        } else {
          const { data, error } = await supabase.from('services').select('name');
          if (error) throw error;
          const serviceNames = data.map(s => s.name);
          setAllServiceNames(serviceNames);
          localStorage.setItem('serviceNamesCache', JSON.stringify(serviceNames));
          localStorage.setItem('serviceNamesTimestamp', Date.now());
        }
        if (session && !sessionStorage.getItem('hasAnimatedText')) {
          setTimeout(() => setRunAnimation(true), 1500);
        }
      } catch (error) {
        console.error('Error fetching/caching service names:', error);
        setAllServiceNames(['Premium Plans']);
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchPopularPlans = async () => {
      try {
        const cachedPlans = localStorage.getItem('popularPlansCache');
        const cachedTimestamp = localStorage.getItem('popularPlansTimestamp');
        const sixHours = 6 * 60 * 60 * 1000;

        if (cachedPlans && cachedTimestamp && Date.now() - cachedTimestamp < sixHours) {
          setPopularPlans(JSON.parse(cachedPlans));
          return;
        }
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
      }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchPopularPlans(), fetchAllServiceNames()]);
        setLoading(false);
    };

    loadData();

  }, [session]);

  // --- (Step 4: Add useEffect to show the popup) ---
  useEffect(() => {
    // Only run this logic if the user is a GUEST
    if (!session) {
      const hasSeenPopup = localStorage.getItem('hasSeenOptionalLoginPopup');
      
      // Set a timer to show the popup
      const timer = setTimeout(() => {
        if (!hasSeenPopup) { // Only show if they haven't dismissed it
          setShowLoginPopup(true);
        }
      }, 3500); // 3.5-second delay

      return () => clearTimeout(timer); // Cleanup the timer
    } else {
      // If user logs in, make sure popup is hidden
      setShowLoginPopup(false);
    }
  }, [session]); // This effect re-runs when the session changes

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

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // --- (Step 5: Add handlers for the popup buttons) ---
  const handleClosePopup = () => {
    setShowLoginPopup(false);
    // Remember this choice so we don't bother them again
    localStorage.setItem('hasSeenOptionalLoginPopup', 'true');
  };

  const handleAuthClickFromPopup = () => {
    handleClosePopup(); // Close this popup first
    openAuthModal(); // Open the main login modal from App.jsx
  };


  const glowMap = {
     purple: '#8747d1',
  };


  return (
    <div className="pt-[72px] sm:pt-[88px] bg-[hsl(0, 0%, 98%)] dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-slate-800 dark:text-white relative">

      {/* --- (Step 6: Pass openAuthModal to TopNavBar) --- */}
      <TopNavBar session={session} openAuthModal={openAuthModal} />

      {/* --- (Step 7: Render the popup component) --- */}
      <OptionalLoginPopup
        isOpen={showLoginPopup}
        onClose={handleClosePopup}
        onAuthClick={handleAuthClickFromPopup}
      />

      <div className="relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">

          {/* Hero Section */}
          <div className="text-center mb-8 px-2 sm:px-4 lg:flex lg:text-left lg:items-center lg:py-12 xl:py-16">
            <div className="mb-6 lg:w-1/2 lg:pr-12 xl:pr-16">
              <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 leading-tight lg:leading-tight">
                Share & Save on{' '}
                {loadingServices ? (
                   <span className="inline-block align-middle min-h-[1.2em] animate-pulse bg-gray-300 dark:bg-gray-700 rounded w-1/2 h-8 lg:h-12"></span>
                ) : (session && runAnimation) ? ( // Only run animation if logged in
                  <SlotMachineAnimation
                    words={allServiceNames}
                    onAnimationEnd={handleAnimationEnd}
                  />
                ) : (
                  <span
                    className="
                      inline-block align-middle min-h-[1.2em]
                      bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent
                      cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => !loadingServices && session && setRunAnimation(true)} // Prevent click if loading or guest
                  >
                    Premium Plans
                  </span>
                )}
              </h1>

              <p className="text-zinc-800 dark:text-zinc-300 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-normal">
                Split costs, multiply savings with friends & family
              </p>

              {/* Buttons (Hidden on mobile, flex on large) */}
              <div className="mt-8 hidden lg:flex gap-4 justify-start">
                 <Link
                  to="/explore"
                  className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  Explore Plans
                </Link>
                <button
                  onClick={scrollToHowItWorks}
                  className="px-6 py-3 rounded-full text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.02]"
                >
                  How ItWorks
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-10 lg:mt-0 lg:w-1/2 lg:gap-4 xl:gap-5">
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
                  className={`${stat.desktopOnly ? 'hidden lg:flex' : 'flex'} h-full flex-col justify-center text-center transform hover:-translate-y-1 lg:hover:-translate-y-2 transition-all duration-300 ease-out hover:shadow-lg`}
                  innerClassName="px-3 py-4 sm:px-4 sm:py-5 lg:py-6 xl:py-7"
                >
                  <div className="text-slate-800 dark:text-white font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl">{stat.value}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm lg:text-base font-medium mt-0.5 sm:mt-1">{stat.label}</div>
                </StarBorder>
              ))}
            </div>
          </div>

          {/* Popular Plans Section */}
          {/* ... (rest of your popular plans, howitworks, cta, faq, footer) ... */}
           {/* Popular Plans Section */}
          <section className="mt-8 sm:mt-10 lg:mt-12">
            <div className="flex items-center justify-between mb-5 sm:mb-6 lg:mb-8">
              <h2 className="text-slate-900 dark:text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
                Popular Plans
                <span className="block w-12 sm:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-purple-400 to-blue-400 mt-2 rounded-full"></span>
              </h2>
              <Link to="/explore" className="text-purple-500 dark:text-purple-300 text-xs sm:text-sm lg:text-base font-semibold hover:text-purple-600 dark:hover:text-purple-200 transition-colors hover:underline underline-offset-4">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center">
                <div className="flex-shrink-0 w-[220px] sm:w-[240px] lg:w-[260px] h-[300px] sm:h-[320px] lg:h-[340px] bg-gray-200 dark:bg-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 animate-pulse"></div>
              </div>
            ) : (
              <>
                {/* --- MOBILE/TABLET CAROUSEL --- */}
                <div className="relative h-[360px] sm:h-[380px] md:h-[400px] flex items-center justify-center lg:hidden">
                  {popularPlans.map((service, index) => {
                    const totalItems = popularPlans.length;
                    const positiveIndex = (index - currentIndex + totalItems) % totalItems;
                    let position = 'far-prev'; 

                    if (positiveIndex === 0) {
                      position = 'active';
                    } else if (positiveIndex === 1) {
                      position = 'next';
                    } else if (positiveIndex === totalItems - 1) {
                      position = 'prev';
                    } else if (positiveIndex === 2) {
                      position = 'far-next'; 
                    }

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

          {/* How It Works Section */}
          <div id="how-it-works-section">
            <HowItWorks />
          </div>

          <HostPlanCTA /> 
          
          <FAQSection/>
          <Footer />

          {/* Spacer for bottom nav */}
          <div className="h-20 sm:h-24 lg:h-28"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;