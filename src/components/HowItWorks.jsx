// src/components/HowItWorks.jsx
import React from 'react';
import { Search, ShieldCheck, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    id: 1,
    icon: <Search className="w-8 h-8 text-purple-600 dark:text-purple-300" />,
    title: 'Pick a Plan You Want',
    desc: 'Browse your favorite streaming or premium service and choose a plan that fits you best.',
    bg: 'from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-900',
  },
  {
    id: 2,
    icon: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-300" />,
    title: 'Join a Verified Group',
    desc: 'Join a secure shared plan hosted by verified users. We handle payments and renewals safely.',
    link: (
      <Link
        to="/rules"
        className="text-sm font-semibold text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 mt-3 inline-block"
      >
        Learn about safety →
      </Link>
    ),
    bg: 'from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-900',
  },
  {
    id: 3,
    icon: <Smile className="w-8 h-8 text-green-600 dark:text-green-300" />,
    title: 'Enjoy Premium & Save',
    desc: 'Get instant access to premium features — at shared group rates up to 80% cheaper.',
    bg: 'from-green-50 to-white dark:from-green-900/30 dark:to-slate-900',
  },
];

const HowItWorks = () => {
  return (
    <section className="my-10 py-14 w-full px-4 sm:px-6 lg:px-12">
      <h2 className="text-slate-900 dark:text-white text-3xl font-bold text-center mb-10">
        How It Works
        <span className="block w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mt-2 rounded-full mx-auto"></span>
      </h2>

      {/* Full-width responsive container */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`group bg-gradient-to-b ${step.bg} rounded-3xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-white/10`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/70 dark:bg-white/10 flex items-center justify-center mx-auto mb-5 shadow-inner group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white text-center">
              {step.id}. {step.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-center mt-3 text-sm leading-relaxed">
              {step.desc}
            </p>
            {step.link && <div className="text-center">{step.link}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
