import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Loader from '../../components/common/Loader';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, host_rating, loyalty_score, created_at, pfp_url, user:users(email)');

      if (error) {
        setError('Failed to fetch users.');
        console.error(error);
      } else {
        // The query above will return user as an array, so we flatten it
        const formattedData = data.map(profile => ({
            ...profile,
            email: profile.user.length > 0 ? profile.user[0].email : 'N/A'
        }));
        setUsers(formattedData);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
            <div className="p-8 flex justify-center items-center"><Loader /></div>
        ) : error ? (
            <p className="p-8 text-center text-red-500">{error}</p>
        ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">User</th>
                        <th scope="col" className="px-6 py-3">Host Rating</th>
                        <th scope="col" className="px-6 py-3">Loyalty Score</th>
                        <th scope="col" className="px-6 py-3">Joined On</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                <div className="flex items-center gap-3">
                                    {user.pfp_url ? (
                                        <img src={user.pfp_url} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div>{user.username}</div>
                                        <div className="text-xs text-gray-500 dark:text-slate-400">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">{user.host_rating.toFixed(1)}</td>
                            <td className="px-6 py-4">{user.loyalty_score}</td>
                            <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;