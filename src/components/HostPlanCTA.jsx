import React from 'react';
import { Link } from 'react-router-dom';
// CHANGE: Imported all necessary icons for the component
import {
  ShieldCheck,
  Zap,
  Banknote,
  Plus,
  ClipboardList,
  Users,
  WalletCards,
  ChevronRight,
  Percent,
  RefreshCw,
} from 'lucide-react';

/* Mobile CTA - Clean version with light/dark mode */
const MobileCTA = () => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-transparent rounded-2xl blur-xl opacity-60" />
      
      <div className="relative z-10 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="mb-5 flex justify-center">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              {/* CHANGE: Replaced SVG with Lucide icon */}
              <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
          </div>
        </div>

        <h3 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-extrabold mb-2 leading-tight text-center">
          Have Empty Spots?
        </h3>
        <div className="text-slate-600 dark:text-slate-300 text-base font-semibold text-center mb-4">
          Turn them into earnings!
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 text-center">
          Share your unused subscription slots and earn money while helping others save.
        </p>

        <Link to="/host-plan" className="block">
          <button className="relative w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative z-10">Host a Plan</span>
          </button>
        </Link>

        <div className="mt-6 flex justify-center gap-8 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            Secure
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Fast Setup
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-purple-500" />
            Earn Daily
          </div>
        </div>
      </div>
    </div>
  );
};

/* Step card content */
const StepCardContent = ({ step, title, description, icon }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md">
        {icon}
      </div>
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold">
        {step}
      </div>
    </div>

    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

/* Outer wrapper for each step */
const StepParent = ({ children }) => (
  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 hover:border-purple-300 dark:hover:border-purple-600 transition-colors duration-200">
    <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 h-full p-5">
      {children}
    </div>
  </div>
);

const HostPlanCTA = () => {
  return (
    <div className="relative my-12">
      {/* MOBILE: Original single CTA with light/dark mode */}
      <div className="md:hidden px-4">
        <MobileCTA />
      </div>

      {/* DESKTOP: Original 4-column layout with proper light/dark support and more breathing room */}
      <div className="hidden md:block px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
            {/* Left column: Main CTA (1 column) */}
            <div className="col-span-1">
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 h-full shadow-sm">
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
                      {/* CHANGE: Replaced SVG with Lucide icon */}
                      <Plus className="w-8 h-8 text-white" strokeWidth={2.5}/>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-400 rounded-full opacity-50 animate-ping" />
                  </div>
                </div>

                <h3 className="text-slate-900 dark:text-white text-2xl font-extrabold mb-2 leading-tight text-center">
                  Have Empty Spots?
                </h3>
                <div className="text-slate-600 dark:text-slate-300 text-sm font-semibold text-center mb-4">
                  Turn Them Into Earnings
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 text-center leading-relaxed">
                  Share your family or group plan, manage members in one dashboard, and automate everything from payments to renewals.
                </p>

                <div className="space-y-3 mb-8">
                  <Link to="/host-plan" className="block">
                    <button className="relative w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative z-10">Start Hosting</span>
                    </button>
                  </Link>

                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center px-2">
                    Earn back costs — automatic payouts & management.
                  </div>
                </div>
                
                {/* CHANGE: Replaced spans with Lucide icons and balanced colors */}
                <div className="flex flex-col gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Secure platform
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-500" />
                    No hidden fees
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-purple-500" />
                    Automated payouts
                  </div>
                </div>

              </div>
            </div>

            {/* Right: 3 step cards (3 columns) */}
            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StepParent>
                <StepCardContent
                  step="I"
                  title="List Your Plan"
                  description="Create your listing in minutes. Set your price, member limits, and availability."
                  // CHANGE: Replaced SVG with Lucide icon
                  icon={<ClipboardList className="w-6 h-6" />}
                />
              </StepParent>

              <StepParent>
                <StepCardContent
                  step="II"
                  title="Manage Members"
                  description="Approve requests, monitor renewals, and control access from your dashboard."
                   // CHANGE: Replaced SVG with Lucide icon
                  icon={<Users className="w-6 h-6" />}
                />
              </StepParent>

              <StepParent>
                <StepCardContent
                  step="III"
                  title="Collect Payouts"
                  description="Automatic payment collection and fast payouts — you keep the earnings."
                   // CHANGE: Replaced SVG with Lucide icon
                  icon={<WalletCards className="w-6 h-6" />}
                />
              </StepParent>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 text-center">
            <Link to="/host-plan" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              More about hosting
              {/* CHANGE: Replaced SVG with Lucide icon */}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostPlanCTA;