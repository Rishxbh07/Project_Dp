import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Info } from 'lucide-react';

// Mock data for services. In a real app, this would come from your backend.
const services = [
  { id: 'spotify', name: 'Spotify', totalCost: 199, maxSlots: 2, credentialType: 'link' },
  { id: 'netflix', name: 'Netflix', totalCost: 799, maxSlots: 4, credentialType: 'credentials' },
  { id: 'disney', name: 'Disney+', totalCost: 299, maxSlots: 4, credentialType: 'credentials' },
];

const HostPlanPage = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(1);
  const [pricePerSlot, setPricePerSlot] = useState(0);
  const [shareLater, setShareLater] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Effect to calculate price per slot
  useEffect(() => {
    if (selectedService) {
      const serviceData = services.find(s => s.id === selectedService);
      if (serviceData && availableSlots > 0) {
        const calculatedPrice = Math.ceil(serviceData.totalCost / (availableSlots + 1)); // +1 for the host
        setPricePerSlot(calculatedPrice);
      }
    } else {
      setPricePerSlot(0);
    }
  }, [selectedService, availableSlots]);

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
    setAvailableSlots(1); // Reset slots when service changes
  };
  
  const isFormValid = () => {
      if (!selectedService || !agreeToTerms) return false;
      if (shareLater) return true;
      if (selectedService === 'spotify' && inviteLink.startsWith('http')) return true;
      if ((selectedService === 'netflix' || selectedService === 'disney') && loginEmail && loginPassword) return true;
      return false;
  }

  return (
    <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
      {/* --- MODIFIED: Header --- */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors text-2xl font-bold w-10 text-left">
            ←
          </Link>
          <h1 className="text-xl font-bold text-center">Host a New Plan</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-8">
        {/* Step 1: Select Service */}
        <section>
          <label className="font-semibold text-lg mb-4 block">1. Select a service</label>
          <div className="grid grid-cols-3 gap-4">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className={`p-4 rounded-2xl border-2 transition-all ${selectedService === service.id ? 'bg-purple-500/20 border-purple-400' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'}`}
              >
                <span className="font-bold text-gray-900 dark:text-white">{service.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Configure Plan */}
        {selectedService && (
          <section className="animate-in fade-in space-y-6">
            <div>
              <label className="font-semibold text-lg mb-4 block">2. Configure your plan</label>
              <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-transparent">
                <p className="text-sm text-gray-500 dark:text-slate-400">Available slots to share:</p>
                <input
                  type="number"
                  min="1"
                  max={services.find(s => s.id === selectedService)?.maxSlots - 1}
                  value={availableSlots}
                  onChange={(e) => setAvailableSlots(parseInt(e.target.value))}
                  className="w-full bg-transparent text-gray-900 dark:text-white text-3xl font-bold p-2 focus:outline-none"
                />
                <p className="text-lg font-bold text-green-600 dark:text-green-400">Price per slot: ₹{pricePerSlot}/month</p>
              </div>
            </div>

            {/* Joining Details Section */}
            <div>
              <h3 className="font-semibold text-lg mb-2">3. Joining Details</h3>
              <div className={`bg-white dark:bg-white/5 p-4 rounded-xl space-y-4 border border-gray-200 dark:border-transparent transition-opacity ${shareLater ? 'opacity-50' : 'opacity-100'}`}>
                {selectedService === 'spotify' && (
                  <input type="text" placeholder="https://open.spotify.com/..." value={inviteLink} onChange={e => setInviteLink(e.target.value)} disabled={shareLater} className="w-full p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200 dark:disabled:bg-slate-900" />
                )}
                {(selectedService === 'netflix' || selectedService === 'disney') && (
                  <>
                    <input type="text" placeholder="Email or Phone Number" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} disabled={shareLater} className="w-full p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200 dark:disabled:bg-slate-900" />
                    <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} disabled={shareLater} className="w-full p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200 dark:disabled:bg-slate-900" />
                  </>
                )}
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <input type="checkbox" id="shareLater" checked={shareLater} onChange={() => setShareLater(!shareLater)} className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500" />
                  <label htmlFor="shareLater" className="ml-2 text-sm text-gray-700 dark:text-slate-300">I prefer to share details later</label>
                </div>
                {shareLater && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 text-xs rounded-lg animate-in fade-in">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Note: This choice is shown to users. Listings with instant joining details are often preferred.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 text-sm">
                <ShieldCheck className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-blue-600 dark:text-blue-300 text-xs">
                    {shareLater
                    ? "Joining credentials are stored securely in an encrypted format and are only shared with members after they successfully join."
                    : "Your credentials will be encrypted and only shared with members after they have paid for their slot."}
                </p>
            </div>
            
            <div className="relative p-6 bg-gray-100 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse"></div>
                <h3 className="font-bold text-lg mb-4 text-center">Host Rules</h3>
                <ul className="space-y-3 text-xs text-gray-600 dark:text-slate-300 list-disc list-inside">
                    <li><span className="font-semibold text-gray-900 dark:text-white">Payouts:</span> Hosts receive the total amount on the 30th day of the plan to their in-app wallet.</li>
                    <li><span className="font-semibold text-gray-900 dark:text-white">User Management:</span> Do not remove users mid-plan. If a user leaves and requests to rejoin, you must provide credentials again.</li>
                    <li><span className="font-semibold text-gray-900 dark:text-white">Plan Duration:</span> Every plan must run for a full 30 days without interruption.</li>
                    <li><span className="font-semibold text-gray-900 dark:text-white">Ratings:</span> Improve your ratings by following these rules carefully.</li>
                </ul>
            </div>

            <div className="flex items-center">
                <input type="checkbox" id="agreeToTerms" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)} className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500" />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700 dark:text-slate-300">I have read the rules and agree to the <Link to="/terms" className="underline text-purple-500 dark:text-purple-400">T&C</Link>.</label>
            </div>

            <button
                disabled={!isFormValid()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
                Host Plan
            </button>
          </section>
        )}
        
        <div className="h-24"></div>
      </div>
    </div>
  );
};

export default HostPlanPage;