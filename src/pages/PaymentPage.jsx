import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const PaymentPage = ({ session }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const order_id = queryParams.get('order_id');
    const amount = queryParams.get('amount');
    const plan_name = queryParams.get('plan_name');

    const handlePayment = () => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: amount * 100,
            currency: "INR",
            name: "DapBuddy",
            description: `Payment for ${plan_name}`,
            order_id: order_id,
            handler: async (response) => {
                const verificationResponse = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify(response),
                    }
                );

                if (!verificationResponse.ok) {
                    alert("Payment verification failed. Please contact support.");
                    return;
                }
                
                // On successful payment, redirect to the subscriptions page
                navigate('/subscription');
            },
            prefill: {
                email: session.user.email,
            },
            theme: {
                color: "#8b5cf6",
            },
            // Add this method object to prioritize UPI
            method: {
                upi: true,
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    useEffect(() => {
        // Automatically trigger payment when the page loads
        handlePayment();
    }, []);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Redirecting to Payment...</h1>
                <p className="text-gray-600 mb-8">If you are not redirected automatically, please click the button below.</p>
                <button
                    onClick={handlePayment}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg"
                >
                    Pay ₹{amount}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;