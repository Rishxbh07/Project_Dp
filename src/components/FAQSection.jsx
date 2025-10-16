// src/components/FAQSection.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: "Is DapBuddy legal to use?",
    a: "Yes. DapBuddy doesn’t sell or redistribute any subscription accounts. We only provide a secure platform for users and hosts to connect and share plan costs safely. We act as a verified payment handler — holding payments in escrow until both sides fulfill their part of the agreement."
  },
  {
    q: "How does DapBuddy protect users?",
    a: "When you join a plan, your payment is securely held in escrow. The host only receives it once they’ve delivered access and your tenure completes successfully. If the host doesn’t deliver within 6 hours (excluding night hours), you’ll either be reassigned to another verified host or refunded in full."
  },
  {
    q: "How does DapBuddy protect hosts?",
    a: "Hosts are paid automatically once the plan tenure is complete — no delays, no disputes. Inactive or unreliable users are flagged through a loyalty rating system, helping hosts match with trustworthy users."
  },
  {
    q: "Can I trust the hosts here?",
    a: "Yes. Hosts are individual account owners with visible ratings and feedback from real users. Our dual-rating system ensures accountability for both hosts and users, encouraging fairness and trust within the community."
  },
  {
    q: "Is my payment information safe?",
    a: "Absolutely. All transactions are processed through secure, PCI-compliant payment gateways. DapBuddy never stores your payment credentials — everything is encrypted and handled by trusted processors."
  },
  {
    q: "What if a host stops renewing the subscription?",
    a: "In rare cases where a host discontinues the plan, we transfer your group to another verified host or refund the remaining tenure. You’ll never lose your money or access without a fair resolution."
  },
  {
    q: "Does DapBuddy charge any fee?",
    a: "Yes — a small platform fee is included in your displayed price. It covers escrow management, payment safety, and customer support so that both hosts and users stay protected."
  },
  {
    q: "Why am I only seeing hosts from my local area?",
    a: "Some subscription services require all members of a shared plan to be from the same household or local region. To comply with these policies and prevent account bans, DapBuddy automatically shows you verified hosts near your area. This ensures your plan remains valid and within each platform’s Terms of Service."
  },
  {
    q: "What if I face an issue during my plan?",
    a: "You can contact our support team anytime. We log all transactions, host IDs, and tenure details so issues are resolved quickly and transparently for both parties."
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="my-20 w-full px-4 sm:px-6 lg:px-12">
      <h2 className="text-slate-900 dark:text-white text-3xl font-bold text-center mb-10">
        Frequently Asked Questions
        <span className="block w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mt-2 rounded-full mx-auto"></span>
      </h2>

      <div className="max-w-7xl mx-auto space-y-4">
        {faqs.map((item, index) => (
          <div
            key={index}
            className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <button
              className="flex justify-between items-center w-full text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-semibold text-slate-800 dark:text-white">
                {item.q}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ${
                openIndex === index ? "max-h-40 mt-3" : "max-h-0"
              }`}
            >
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {item.a}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <div className="text-center mt-8">
        <Link
          to="/legal"
          className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 font-semibold text-sm transition-colors"
        >
          Read in Details →
        </Link>
      </div>
    </section>
  );
};

export default FAQSection;
