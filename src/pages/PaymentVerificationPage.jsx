// src/pages/PaymentVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/common/Loader';
import { CheckCircle, XCircle } from 'lucide-react';

const PaymentVerificationPage = ({ session }) => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const razorpay_payment_id = params.get('razorpay_payment_id');
      const razorpay_order_id = params.get('razorpay_order_id');
      const razorpay_signature = params.get('razorpay_signature');

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        setError('Payment details are missing. Cannot verify.');
        setStatus('failed');
        return;
      }
      
      try {
        const verificationResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            }),
          }
        );

        if (!verificationResponse.ok) {
          throw new Error('Payment signature verification failed.');
        }

        setStatus('success');
        setTimeout(() => {
          navigate('/subscription');
        }, 3000);

      } catch (err) {
        setError(err.message);
        setStatus('failed');
      }
    };

    // --- FIX: Handle case where session is missing ---
    if (session) {
      verifyPayment();
    } else {
        // If session is still loading, we wait. If it's null (not logged in), we should fail or redirect.
        // Assuming session is passed as null when not logged in:
        const checkSession = setTimeout(() => {
            if (!session) {
                setError("You must be logged in to verify payment.");
                setStatus('failed');
            }
        }, 2000); // Wait 2 seconds for session to load
        return () => clearTimeout(checkSession);
    }
  }, [session, location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 text-center px-4">
      {status === 'verifying' && (
        <div>
          <Loader />
          <h1 className="text-xl font-bold mt-4 text-gray-800 dark:text-white">Verifying Payment...</h1>
          <p className="text-gray-500 dark:text-slate-400">Please do not close this window.</p>
        </div>
      )}
      {status === 'success' && (
        <div className="animate-in fade-in">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Payment Successful!</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Your plan is now active. Redirecting you to your subscriptions...</p>
        </div>
      )}
      {status === 'failed' && (
        <div className="animate-in fade-in">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Payment Failed</h1>
          <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>
          <button onClick={() => navigate('/explore')} className="mt-6 bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg">
            Back to Explore
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentVerificationPage;