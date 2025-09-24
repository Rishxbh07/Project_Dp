import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Share2, Download, Copy, Loader2 } from 'lucide-react';

const InvitePage = ({ session }) => {
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState('');
    const qrCodeRef = useRef(null);

    const user = session?.user;
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(referralLink)}`;

    useEffect(() => {
        const fetchReferralCode = async () => {
            if (user) {
                setLoading(true);
                // --- FIX: Changed from 'profiles' to 'referrals' table ---
                const { data, error } = await supabase
                    .from('referrals') // Corrected table name
                    .select('referral_code')
                    .eq('user_id', user.id) // Assuming the column is user_id
                    .single();

                if (error) {
                    console.error('Error fetching referral code:', error);
                } else if (data) {
                    setReferralCode(data.referral_code);
                }
                setLoading(false);
            }
        };

        fetchReferralCode();
    }, [user]);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode).then(() => {
            setCopySuccess('Code Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me on DapBuddy!',
                    text: `Save on subscriptions with me on DapBuddy. Use my code: ${referralCode}`,
                    url: referralLink,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    };
    
    const handleDownload = async () => {
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `dapbuddy-referral-qr-${referralCode}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error downloading QR code:', error);
        }
    };


    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/profile" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                        &larr; Back
                    </Link>
                    <h1 className="text-xl font-bold">Invite & Earn</h1>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Share the Savings</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Invite friends to DapBuddy and you'll both get rewards when they join their first plan.</p>

                <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg">
                    {loading ? (
                        <div className="h-[256px] w-[256px] mx-auto flex items-center justify-center">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                        </div>
                    ) : (
                        <img 
                            ref={qrCodeRef}
                            src={qrCodeUrl}
                            alt="Your Referral QR Code" 
                            className="w-64 h-64 mx-auto rounded-xl border border-gray-200 dark:border-white/10"
                        />
                    )}

                    <div className="mt-6">
                        <p className="text-sm text-gray-500 dark:text-slate-400">Your Referral Code</p>
                        <div className="relative mt-2">
                             <input
                                type="text"
                                value={loading ? "Loading..." : referralCode}
                                readOnly
                                className="w-full text-center text-2xl font-bold tracking-widest bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg p-3 border border-gray-300 dark:border-slate-600 focus:outline-none"
                            />
                            <button onClick={handleCopy} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-purple-500 transition-colors">
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                        {copySuccess && <p className="text-purple-500 text-xs mt-2 animate-in fade-in">{copySuccess}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-white/20 transition-all transform hover:scale-105">
                        <Share2 className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">Share</span>
                    </button>
                     <button onClick={handleDownload} className="flex items-center justify-center gap-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-white/20 transition-all transform hover:scale-105">
                        <Download className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">Download</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default InvitePage;