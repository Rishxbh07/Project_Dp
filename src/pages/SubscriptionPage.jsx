import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import SubscriptionCard from '../components/SubscriptionCard';
import HostedPlanCard from '../components/HostedPlanCard';
import { LogIn } from 'lucide-react';

const SubscriptionPage = ({ session }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mySubscriptions');
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [hostedPlans, setHostedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data: subsData, error: subsError } = await supabase
          .from('bookings')
          .select(`
            id,
            joined_at,
            listing:listings (
              id,
              seats_total,
              seats_available,
              service:services (
                name
              ),
              host:profiles (
                username
              )
            ),
            transaction:transactions (
              final_amount_charged
            )
          `)
          .eq('buyer_id', session.user.id);

        if (subsError) throw subsError;

        const formattedSubs = subsData.map(sub => ({
          id: sub.id,
          serviceName: sub.listing.service.name,
          hostName: sub.listing.host.username,
          rate: sub.transaction.final_amount_charged,
          renewalDate: new Date(new Date(sub.joined_at).setMonth(new Date(sub.joined_at).getMonth() + 1)).toLocaleDateString(),
          slotsFilled: sub.listing.seats_total - sub.listing.seats_available,
          slotsTotal: sub.listing.seats_total,
        }));
        setMySubscriptions(formattedSubs);

        const { data: hostedData, error: hostedError } = await supabase
          .from('listings')
          .select(`
            id,
            created_at,
            seats_total,
            seats_available,
            average_rating, 
            service:services (
              name,
              base_price
            )
          `)
          .eq('host_id', session.user.id);

        if (hostedError) throw hostedError;
        
        const formattedHosted = hostedData.map(plan => ({
          ...plan,
          serviceName: plan.service.name,
        }));
        setHostedPlans(formattedHosted);

      } catch (error) {
        setError(error.message);
        console.error("Error fetching subscription data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (!session) {
    return (
      <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <LogIn className="w-16 h-16 text-purple-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">View Your Plans</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6">Log in to manage your subscriptions and hosted plans.</p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 text-center">
          <h1 className="text-xl font-bold">Your Plans</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="relative flex p-1 bg-gray-200 dark:bg-slate-800/80 backdrop-blur-md rounded-full mb-8">
          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-transform duration-300 ease-in-out ${
              activeTab === 'hostedPlans' ? 'transform translate-x-full' : ''
            }`}
          ></div>
          <button
            onClick={() => setActiveTab('mySubscriptions')}
            className="relative w-1/2 py-2 text-sm font-semibold z-10 text-gray-800 dark:text-white"
          >
            My Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('hostedPlans')}
            className="relative w-1/2 py-2 text-sm font-semibold z-10 text-gray-800 dark:text-white"
          >
            Hosted Plans
          </button>
        </div>

        <div className="px-4">
          {loading && <p>Loading plans...</p>}
          {error && <p className="text-red-500">{error}</p>}
          
          {activeTab === 'mySubscriptions' && !loading && (
            <div className="space-y-4 animate-in fade-in">
              {mySubscriptions.length > 0 ? (
                mySubscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)
              ) : (
                <div className="text-center py-16 px-4 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/20">
                  <p className="text-gray-500 dark:text-slate-400 mb-4">You haven't joined any plans yet.</p>
                  <Link to="/explore">
                    <button className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-purple-700 transition-all">
                      Join a Plan
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hostedPlans' && !loading && (
            <div className="animate-in fade-in">
              {hostedPlans.length > 0 ? (
                <div className="space-y-4">
                  {hostedPlans.map(plan => <HostedPlanCard key={plan.id} plan={plan} />)}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/20">
                  <p className="text-gray-500 dark:text-slate-400 mb-4">No plans Hosted yet</p>
                  <Link to="/host-plan">
                    <button className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-purple-700 transition-all">
                      Host a Plan
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
       <div className="h-24"></div>
    </div>
  );
};

export default SubscriptionPage;