import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom'; // Added Navigate
import { CheckCircle2, XCircle, Loader2, Copy, Calendar, IndianRupee, ShieldAlert } from 'lucide-react';

const PaymentResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(10);

    // 1. Industry Standard: Handle "missing state" redirect declaratively
    // If state is missing, return <Navigate /> immediately. 
    // This prevents the component from mounting invalidly and handles the redirect cleanly.
    if (!location.state) {
        return <Navigate to="/" replace />;
    }

    // Extract data passed from navigation state
    const { status, transactionId, amount, planName } = location.state;
    
    const isSuccess = status === 'success';
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    useEffect(() => {
        // 2. Timer logic remains in useEffect as it is a side effect
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (isSuccess) {
                        navigate('/subscription', { replace: true });
                    } else {
                        navigate('/', { 
                            replace: true, 
                            state: { toastMessage: "Something went wrong, please try again later :/" } 
                        });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, isSuccess]); // Removed location.state from deps as it's handled above

    // Copy Transaction ID to clipboard
    const copyToClipboard = () => {
        if (transactionId) {
            navigator.clipboard.writeText(transactionId);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isSuccess ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5 animate-in fade-in zoom-in duration-300">
                
                {/* Header Icon */}
                <div className={`h-32 flex items-center justify-center ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isSuccess ? (
                        <CheckCircle2 className="w-16 h-16 text-white animate-bounce" />
                    ) : (
                        <XCircle className="w-16 h-16 text-white animate-pulse" />
                    )}
                </div>

                <div className="p-8 text-center">
                    <h1 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                    </h1>
                    
                    <p className="text-gray-500 dark:text-slate-400 mb-8">
                        {isSuccess 
                            ? `You have successfully joined ${planName || 'the plan'}.`
                            : "We couldn't process your payment."}
                    </p>

                    {isSuccess ? (
                        <div className="space-y-4 mb-8">
                            {/* Transaction Details Card */}
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10 space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-slate-400">Amount Paid</span>
                                    <span className="font-bold text-gray-900 dark:text-white flex items-center">
                                        <IndianRupee className="w-3 h-3 mr-1" />{amount}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-slate-400">Valid Until</span>
                                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                                        <Calendar className="w-3 h-3 mr-1 text-purple-500" />
                                        {validUntil.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 dark:border-white/10">
                                    <span className="text-gray-500 dark:text-slate-400">Transaction ID</span>
                                    <button onClick={copyToClipboard} className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-600 font-mono bg-purple-50 dark:bg-purple-500/10 px-2 py-1 rounded-md transition-colors">
                                        {transactionId?.slice(0, 12)}... <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-left bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3">
                                <div className="mt-1"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div>
                                <div>
                                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Next Steps</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                                        The host will send your joining details very soon. We'll notify you immediately when they do. Happy saving!
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl flex gap-3 text-left mb-8 border border-red-100 dark:border-red-500/20">
                            <ShieldAlert className="w-10 h-10 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                                Don't worry! If any money was debited from your account, it will be automatically credited back within 5-7 business days.
                            </p>
                        </div>
                    )}

                    {/* Redirection Timer */}
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ease-linear ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} 
                                style={{ width: `${(timeLeft / 6) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400">
                            Redirecting in {timeLeft} seconds...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;