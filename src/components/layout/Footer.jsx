// src/components/layout/Footer.jsx
import React from "react";
import { 
  FaInstagram, 
  FaRedditAlien, 
  FaTwitter, 
  FaGlobeAsia, 
  FaYoutube // <-- CORRECTED: Use the Font Awesome version
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-purple-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-t border-slate-200/50 dark:border-white/10 rounded-t-3xl shadow-[0_-2px_20px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {/* Brand Column */}
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            DapBuddy
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 max-w-xs">
            Split premium plans, save together.   
            Built to keep your subscriptions smarter, safer, and more affordable.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-3">
            Safe. Verified. Transparent.
          </p>
        </div>

        {/* Links Column */}
        <div className="grid grid-cols-2 gap-8">
          {/* Company Section */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/about", text: "About Us" },
                { to: "/contact", text: "Contact" },
                { to: "/blog", text: "Blog" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-slate-600 dark:text-slate-300 hover:text-purple-500 hover:underline underline-offset-4 decoration-purple-400 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
              Legal & Info
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/how-it-works", text: "How It Works" },
                { to: "/faq", text: "FAQs" },
                { to: "/terms", text: "Terms & Conditions" },
                { to: "/privacy", text: "Privacy Policy" },
                { to: "/refunds", text: "Refund Policy" },
                { to: "/legal", text: "Legal & Compliance" },
                { to: "/safety", text: "Safety Guidelines" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-slate-600 dark:text-slate-300 hover:text-purple-500 hover:underline underline-offset-4 decoration-purple-400 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Column */}
        <div className="lg:text-right sm:col-span-2 lg:col-span-1">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
            Follow Us
          </h4>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
            Stay updated with new services and exclusive offers.
          </p>
          <div className="flex justify-start lg:justify-end gap-5">
            <a
              href="#"
              title="YouTube"
              className="text-slate-500 hover:text-red-500 transition-colors"
            >
              {/* CORRECTED: Use the Font Awesome component */}
              <FaYoutube className="w-5 h-5" /> 
            </a>
            <a
              href="#"
              title="Instagram"
              className="text-slate-500 hover:text-pink-500 transition-colors"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              title="Reddit"
              className="text-slate-500 hover:text-orange-500 transition-colors"
            >
              <FaRedditAlien className="w-5 h-5" />
            </a>
            <a
              href="#"
              title="Twitter (X)"
              className="text-slate-500 hover:text-blue-500 transition-colors"
            >
              <FaTwitter className="w-5 h-5" />
            </a>
            {/* <a
              href="#"
              title="Official Website"
              className="text-slate-500 hover:text-purple-500 transition-colors"
            >
              <FaGlobeAsia className="w-5 h-5" />
            </a> */}
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-200/50 dark:border-white/10 text-center py-6 bg-white/50 dark:bg-white/5">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} DapBuddy. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;