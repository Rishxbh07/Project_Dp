import React from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, IndianRupee } from 'lucide-react';

const PaymentSection = ({ 
    paymentOption, 
    setPaymentOption, 
    useCoins, 
    setUseCoins, 
    walletBalance, 
    priceDetails, 
    isBreakdownVisible, 
    setIsBreakdownVisible 
}) => {
    return (
        <>
            <section className="mb-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 px-1">Payment Option</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setPaymentOption('autoPay')}
                        className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative group ${paymentOption === 'autoPay' ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-md' : 'border-transparent bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        {paymentOption === 'autoPay' && <div className="absolute top-4 right-4 text-purple-500"><CheckCircle2 className="w-6 h-6 fill-current" /></div>}
                        <div className="font-bold text-lg text-gray-900 dark:text-white">Auto Pay</div>
                        <div className="text-sm text-gray-500 mt-1">Best value, renews automatically.</div>
                    </button>

                    <button 
                        onClick={() => setPaymentOption('oneTime')}
                        className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative group ${paymentOption === 'oneTime' ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-md' : 'border-transparent bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        {paymentOption === 'oneTime' && <div className="absolute top-4 right-4 text-purple-500"><CheckCircle2 className="w-6 h-6 fill-current" /></div>}
                        <div className="font-bold text-lg text-gray-900 dark:text-white">One Time</div>
                        <div className="text-sm text-gray-500 mt-1">Pay for one month only.</div>
                    </button>
                </div>
            </section>

            <section className="mb-6 space-y-3">
                <div className={`flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border transition-colors ${useCoins ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200 dark:border-white/10'}`}>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => walletBalance >= 10 && setUseCoins(!useCoins)}>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${useCoins ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'}`}>
                             {useCoins && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                             <span className="text-sm md:text-base font-medium text-gray-800 dark:text-slate-200">
                                Apply Promo Coins
                            </span>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Available Balance: {walletBalance}</p>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">-₹10.00</span>
                </div>

                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                    <button 
                        onClick={() => setIsBreakdownVisible(!isBreakdownVisible)}
                        className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <span className="font-semibold text-gray-800 dark:text-white">Price Breakdown</span>
                        {isBreakdownVisible ? <ChevronUp className="w-5 h-5 text-gray-400"/> : <ChevronDown className="w-5 h-5 text-gray-400"/>}
                    </button>
                    
                    {isBreakdownVisible && (
                        <div className="px-4 pb-4 space-y-3 text-sm border-t border-gray-100 dark:border-white/5 pt-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>Base Price</span><span>₹{priceDetails.base}</span></div>
                            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>Platform Fee</span><span>+ ₹{priceDetails.platformFee}</span></div>
                            {paymentOption === 'oneTime' && <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>Convenience Fee (10%)</span><span>+ ₹{priceDetails.convenienceFee}</span></div>}
                            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>GST ({paymentOption === 'oneTime' ? '18%' : '12%'})</span><span>+ ₹{priceDetails.tax}</span></div>
                            {useCoins && <div className="flex justify-between text-green-600 dark:text-green-400 font-medium"><span>Coin Discount</span><span>- ₹{priceDetails.coinDiscount}</span></div>}
                            <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-3 border-t border-dashed border-gray-200 dark:border-white/10 text-base"><span>Total Payable</span><span>₹{priceDetails.total}</span></div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default PaymentSection;