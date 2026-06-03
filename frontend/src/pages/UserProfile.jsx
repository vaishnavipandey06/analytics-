import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiUser, FiLock, FiCheck } from 'react-icons/fi';

const UserProfile = () => {
  const { user, API_URL } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in password fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        email: user.email,
        password: formData.password
      });

      if (res.data.status === 'success') {
        setMessage('Password updated successfully.');
        setFormData({ password: '', confirmPassword: '' });
      }
    } catch (err) {
      setError('Failed to update password. Server error.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Account Profile</h2>
        <p className="text-slate-400 text-xs">Manage your user profile credentials and check active system roles.</p>
      </div>

      {message && (
        <div className="p-4 bg-success-light/10 text-success border border-success-light/35 text-xs rounded-xl flex items-center gap-2">
          <FiCheck className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger-light/10 text-danger border border-danger-light/35 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiUser className="text-primary" /> Profile Credentials
          </h4>

          <div className="flex flex-col items-center text-center space-y-3 py-4">
            <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center font-bold text-3xl text-primary border border-indigo-200 dark:border-indigo-900 shadow-sm">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-base">{user?.name || 'User Profile'}</h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider block mt-1 w-fit mx-auto">
                {user?.role || 'Analyst'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">User Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">User Permissions:</span>
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {user?.role === 'Admin' ? 'Create, Read, Update, Delete, Settings' : 'Read Predictions, Export Reports'}
              </span>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiLock className="text-secondary" /> Update Password
          </h4>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                placeholder="Repeat new password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
            >
              {updating ? 'Saving Changes...' : 'Update Password Credentials'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
