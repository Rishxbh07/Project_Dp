import React from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaInstagram, FaRedditAlien, FaTwitter } from 'react-icons/fa';
import Logo from './navbar/Logo.new.jsx';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand, Slogan, Desc, Socials */}
          <div className="space-y-5">
            <div className="flex flex-col items-start">
              <Link to="/">
                <Logo />
              </Link>
              <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent ml-1 mt-1">
                The saving funda
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              Share premium digital subscriptions securely. Save money, manage access, and connect with a trusted community.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-5 pt-1">
              <a href="#" className="text-slate-400 hover:text-[#FF0000] transform hover:scale-110 transition-all duration-200" aria-label="YouTube">
                <FaYoutube size={22} />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#E1306C] transform hover:scale-110 transition-all duration-200" aria-label="Instagram">
                <FaInstagram size={22} />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#FF4500] transform hover:scale-110 transition-all duration-200" aria-label="Reddit">
                <FaRedditAlien size={22} />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#1DA1F2] transform hover:scale-110 transition-all duration-200" aria-label="Twitter">
                <FaTwitter size={22} />
              </a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5">Platform</h3>
            <ul className="space-y-3.5">
              <li><Link to="/explore" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Explore Plans</Link></li>
              <li><Link to="/host-plan" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Start Hosting</Link></li>
              <li><Link to="/request-service" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Request Service</Link></li>
              <li><Link to="/achievements" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Rewards</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5">Company</h3>
            <ul className="space-y-3.5">
              <li><Link to="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">About Us</Link></li>
              <li><Link to="/blog" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Blog</Link></li>
              <li><Link to="/careers" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Careers</Link></li>
              <li>
                <Link to="/partner" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all flex items-center gap-2 w-fit">
                  Partner with Us
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">New</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5">Trust & Support</h3>
            <ul className="space-y-3.5">
              <li><Link to="/help" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Help Center</Link></li>
              <li><Link to="/safety" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Safety Center</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Terms of Service</Link></li>
              <li><Link to="/verify-identity" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline decoration-2 underline-offset-4 transition-all">Verify Identity</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} DapBuddy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;