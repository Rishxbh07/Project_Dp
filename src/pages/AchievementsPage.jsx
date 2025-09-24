import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Award, Lock, Gift, CheckCircle } from 'lucide-react';
import Loader from '../components/common/Loader';

// A single card for an achievement
const AchievementCard = ({ achievement, isUnlocked }) => {
    return (
        <div className={`relative p-4 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${isUnlocked ? 'border-green-500 bg-green-500/10' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5'}`}>
            {isUnlocked && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unlocked</span>
                </div>
            )}
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${isUnlocked ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
                    <Award className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-gray-400 dark:text-slate-400'}`} />
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-300'}`}>{achievement.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{achievement.description}</p>
                </div>
                {!isUnlocked && <Lock className="w-6 h-6 text-gray-400 dark:text-slate-500 flex-shrink-0" />}
            </div>
        </div>
    );
};

const AchievementsPage = ({ session }) => {
    const [allAchievements, setAllAchievements] = useState([]);
    const [unlockedIds, setUnlockedIds] = useState(new Set());
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!session) return;
            setLoading(true);

            try {
                // Fetch all possible achievements and user's unlocked achievements in parallel
                const [achievementsRes, unlockedRes, promosRes] = await Promise.all([
                    supabase.from('achievements').select('*'),
                    supabase.from('user_achievements').select('achievement_id').eq('user_id', session.user.id),
                    supabase.from('promo_codes').select('*').eq('user_id', session.user.id).eq('is_used', false)
                ]);

                if (achievementsRes.error) throw achievementsRes.error;
                setAllAchievements(achievementsRes.data);

                if (unlockedRes.error) throw unlockedRes.error;
                const unlockedSet = new Set(unlockedRes.data.map(a => a.achievement_id));
                setUnlockedIds(unlockedSet);

                if (promosRes.error) throw promosRes.error;
                setPromoCodes(promosRes.data);

            } catch (err) {
                setError('Failed to load achievements.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/profile" className="text-purple-500 dark:text-purple-400 text-sm">
                        &larr; Back to Profile
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h1>
                    <div className="w-32"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 pb-24">
                {loading ? <Loader /> : error ? <p className="text-center text-red-500">{error}</p> : (
                    <>
                        {/* Promo Codes Section */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your Promo Codes</h2>
                            {promoCodes.length > 0 ? (
                                <div className="space-y-3">
                                    {promoCodes.map(promo => (
                                        <div key={promo.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-dashed border-purple-400 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <Gift className="w-6 h-6 text-purple-500" />
                                                <div>
                                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{promo.code}</p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">₹{promo.discount_amount} off your next purchase</p>
                                                </div>
                                            </div>
                                            <button className="text-purple-600 font-semibold text-sm">Copy</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-slate-400">No active promo codes. Unlock achievements to earn some!</p>
                            )}
                        </section>

                        {/* Achievements Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Badges & Tasks</h2>
                             <div className="space-y-4">
                                {allAchievements.map(ach => (
                                    <AchievementCard
                                        key={ach.id}
                                        achievement={ach}
                                        isUnlocked={unlockedIds.has(ach.id)}
                                    />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default AchievementsPage;