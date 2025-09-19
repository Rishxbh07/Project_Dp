import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Auth = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(isLogin ? 'Logged in successfully!' : 'Check your email for the confirmation link!');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-white text-2xl font-bold mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isLogin ? 'Log in to continue your journey' : 'Join DapBuddy and start saving today'}
        </p>
      </div>

      {/* Google Sign-in Button */}
      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full mb-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-xl border border-gray-200 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-70"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-3 text-slate-400 font-medium">Or</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleAuth} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-slate-800/50 text-white rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-slate-800/50 text-white rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
        </button>
      </form>

      {message && (
        <p className={`text-center text-sm mt-4 ${message.includes('error') || message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}

      <div className="text-center mt-6">
        <p className="text-slate-400 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-purple-400 font-semibold hover:text-purple-300 transition-colors duration-200 mt-1"
        >
          {isLogin ? 'Create Account' : 'Log In'}
        </button>
      </div>
    </div>
  );
};

export default Auth;