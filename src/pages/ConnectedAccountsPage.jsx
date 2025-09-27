import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronRight, ShieldCheck, Link2 } from 'lucide-react';
import Loader from '../components/common/Loader';

const ConnectedAccountCard = ({ account }) => {
    const { services: service } = account;

    // Helper to display the primary identifier for the service
    const getPrimaryIdentifier = () => {
        if (service.name.toLowerCase().includes('spotify')) {
            return { label: 'Spotify User ID', value: account.service_uid };
        }
        if (service.name.toLowerCase().includes('youtube')) {
            return { label: 'YouTube Email', value: account.joined_email };
        }
        return { label: 'Profile Link', value: account.profile_link };
    };

    const primaryId = getPrimaryIdentifier();

    return (
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    {service.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                        Linked on {new Date(account.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">{primaryId.label}:</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{primaryId.value}</span>
                </div>
                {account.service_profile_name && (
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Profile Name:</span>
                        <span className="font-semibold text-gray-800 dark:text-slate-200">{account.service_profile_name}</span>
                    </div>
                )}
            </div>
            <div className="mt-4">
                <Link to={`/profile/request-change/${account.id}`} className="w-full text-center block bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 text-purple-600 dark:text-purple-400 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                    Request Change
                </Link>
            </div>
        </div>
    );
};

const ConnectedAccountsPage = ({ session }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConnectedAccounts = async () => {
            if (!session) return;
            setLoading(true);
            
            const { data, error } = await supabase
                .from('connected_accounts')
                .select(`
                    *,
                    services (*)
                `)
                .eq('buyer_id', session.user.id);

            if (error) {
                setError('Failed to load connected accounts.');
                console.error(error);
            } else {
                setAccounts(data);
            }
            setLoading(false);
        };

        fetchConnectedAccounts();
    }, [session]);

    return (
        <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/profile" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                        &larr; Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Connected Accounts</h1>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {loading ? <Loader /> : error ? <p className="text-center text-red-500">{error}</p> : (
                    accounts.length > 0 ? (
                        <div className="space-y-4">
                            {accounts.map(account => (
                                <ConnectedAccountCard key={account.id} account={account} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/20">
                            <Link2 className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">No Accounts Linked Yet</h3>
                            <p className="text-gray-500 dark:text-slate-400 mt-2">When you join a plan that requires account details, it will appear here.</p>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default ConnectedAccountsPage;