import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import SubscriptionCard from "../components/SubscriptionCard";
import HostedPlanCard from "../components/HostedPlanCard";
import Loader from "../components/common/Loader";
import { PlusCircle, Crown, Layers } from "lucide-react";

const SubscriptionPage = ({ session }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mySubscriptions");
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [hostedPlans, setHostedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [allSubsRes, hostedPlansRes] = await Promise.all([
        supabase.rpc("get_all_user_subscriptions", { p_user_id: session.user.id }),
        supabase.rpc("get_hosted_plans", { p_host_id: session.user.id })
      ]);

      if (allSubsRes.error) throw allSubsRes.error;
      if (hostedPlansRes.error) throw hostedPlansRes.error;

      const formattedSubscriptions = (allSubsRes.data || []).map(sub => ({
        id: sub.booking_id,
        serviceName: sub.service_name,
        hostName: sub.host_name,
        rate: sub.final_amount_charged,
        renewalDate: new Date(sub.latest_expiry).toLocaleDateString(),
        slotsFilled: sub.seats_total - sub.seats_available,
        slotsTotal: sub.seats_total,
        status: sub.status,
        isPublic: sub.is_public,
        path: sub.is_dapbuddy_plan
          ? `/dapbuddy-subscription/${sub.booking_id}`
          : `/subscription/${sub.booking_id}`,
      }));

      formattedSubscriptions.sort((a, b) => new Date(b.joined_at) - new Date(a.joined_at));
      setMySubscriptions(formattedSubscriptions);

      const formattedHosted = (hostedPlansRes.data || []).map(plan => ({
        id: plan.id,
        createdAt: plan.created_at,
        seatsTotal: plan.seats_total,
        seatsAvailable: plan.seats_available,
        total_rating: plan.total_rating,
        rating_count: plan.rating_count,
        serviceName: plan.service_name,
        basePrice: plan.base_price,
        isPublic: plan.is_public ?? true,
      }));
      setHostedPlans(formattedHosted);

    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Something went wrong while loading your plans.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchData();
    const handleRefresh = () => fetchData();
    window.addEventListener("refreshHostedPlans", handleRefresh);
    return () => window.removeEventListener("refreshHostedPlans", handleRefresh);
  }, [fetchData]);

  const EmptyState = ({ type }) => (
    <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/20 shadow-sm">
      <div className="flex flex-col items-center space-y-3">
        {type === "subscriptions" ? (
          <Crown className="w-10 h-10 text-purple-400" />
        ) : (
          <Layers className="w-10 h-10 text-purple-400" />
        )}
        <p className="text-gray-500 dark:text-slate-400 font-medium">
          {type === "subscriptions"
            ? "You haven’t joined any plans yet."
            : "No hosted plans yet."}
        </p>
        <Link
          to={type === "subscriptions" ? "/explore" : "/host-plan"}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-purple-500/20"
        >
          <PlusCircle size={18} />
          {type === "subscriptions" ? "Join a Plan" : "Host a Plan"}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white transition-all duration-300">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Your Plans
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-md mx-auto relative flex p-1 bg-gray-200 dark:bg-slate-800/80 backdrop-blur-md rounded-full mb-10 shadow-inner">
          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-transform duration-300 ease-in-out ${
              activeTab === "hostedPlans" ? "translate-x-full" : ""
            }`}
          ></div>
          <button
            onClick={() => setActiveTab("mySubscriptions")}
            className={`relative w-1/2 py-2 text-sm font-semibold z-10 transition-all ${
              activeTab === "mySubscriptions"
                ? "text-white"
                : "text-gray-800 dark:text-slate-300"
            }`}
          >
            My Subscriptions
          </button>
          <button
            onClick={() => setActiveTab("hostedPlans")}
            className={`relative w-1/2 py-2 text-sm font-semibold z-10 transition-all ${
              activeTab === "hostedPlans"
                ? "text-white"
                : "text-gray-800 dark:text-slate-300"
            }`}
          >
            Hosted Plans
          </button>
        </div>

        {loading && <Loader />}
        {error && (
          <p className="text-red-500 text-center font-medium mb-4">{error}</p>
        )}

        {!loading && !error && (
          <>
            {activeTab === "mySubscriptions" && (
              <div className="animate-in fade-in">
                {mySubscriptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mySubscriptions.map((sub) => (
                      <SubscriptionCard key={sub.id} subscription={sub} />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="subscriptions" />
                )}
              </div>
            )}

            {activeTab === "hostedPlans" && (
              <div className="animate-in fade-in">
                {hostedPlans.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hostedPlans.map((plan) => (
                      <HostedPlanCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="hosted" />
                )}
              </div>
            )}
          </>
        )}
      </main>

      <div className="h-24"></div>
    </div>
  );
};

export default SubscriptionPage;