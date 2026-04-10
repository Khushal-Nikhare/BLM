import React, { useState } from 'react';

import axios from 'axios';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        email,
        password,
        role
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail('');
        setPassword('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add New User</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create a new member or admin account</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg text-center border border-green-200 dark:border-green-900/50">
            <p className="font-medium">User created successfully!</p>
            <p className="text-sm mt-1 text-green-600 dark:text-green-500">They can now log in.</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-slate-800 dark:text-slate-100"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-slate-800 dark:text-slate-100"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating user...' : 'Create User'}
            </button>
          </form>
        )}


      </div>
    </div>
  );
};

export default RegisterPage;
