// src/components/HowItWorks.jsx
import React from 'react';
import { Search, ShieldCheck, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <section className="my-10 py-10">
      <h2 className="text-slate-900 dark:text-white text-3xl font-bold text-center mb-8">
        How It Works
        <span className="block w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mt-2 rounded-full mx-auto"></span>
      </h2>

      <div className="space-y-8 max-w-sm mx-auto lg:max-w-5xl lg:flex lg:space-x-8 lg:space-y-0">
        {/* Step 1 */}
        <div className="flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-center lg:text-center">
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

        {/* Step 2 */}
        <div className="flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-center lg:text-center">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">2. Join Securely</h3>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Pay safely through our platform. We hold your payment and only release it to the host after your monthly subscription tenure is successfully completed.
            </p>
            <Link
              to="/rules"
              className="text-sm font-semibold text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 mt-2 inline-block"
            >
              Know more in details &rarr;
            </Link>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-center lg:text-center">
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
  );
};

export default HowItWorks;
