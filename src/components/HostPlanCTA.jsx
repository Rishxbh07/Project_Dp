import React from 'react';

const HostPlanCTA = () => {
  return (
    <section className="relative my-10 group">
      {/* Enhanced background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
      
      {/* Main CTA container with glassmorphism */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 text-center p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:24px_24px] opacity-30"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Enhanced icon/emoji */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-3 transition-transform duration-300">
                💎
              </div>
              {/* Sparkle effects */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping delay-150"></div>
            </div>
          </div>
          
          {/* Enhanced heading with better typography */}
          <h3 className="text-white text-3xl font-bold mb-3 leading-tight">
            Have Empty Spots?
            <span className="block text-xl font-semibold text-slate-300 mt-1">
              Turn them into earnings!
            </span>
          </h3>
          
          {/* Value proposition */}
          <p className="text-slate-400 text-base mb-6 max-w-sm mx-auto leading-relaxed">
            Share your unused subscription slots and earn money while helping others save.
          </p>
          
          {/* Enhanced CTA button with multiple states */}
          <button className="group/btn relative bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-95 overflow-hidden">
            
            {/* Button background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
            
            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>Host a Plan</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center space-x-6 mt-6 text-sm text-slate-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
              <span>Fast Setup</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
              <span>Earn Daily</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HostPlanCTA;