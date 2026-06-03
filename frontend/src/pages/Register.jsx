import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Analyst');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all registration fields.');
      return;
    }

    setSubmitting(true);
    const result = await register(name, email, password, role);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      {/* Background ambient glows */}
      <div className="fixed top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary items-center justify-center text-white font-bold text-lg mb-2">
            C
          </div>
          <h2 className="text-2xl font-bold">Create ChurnVision Account</h2>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Access Predictive Intelligence</p>
        </div>

        {error && (
          <div className="p-4 bg-danger-light/10 text-danger border border-danger-light/35 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-4 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-primary text-sm transition-colors"
                placeholder="e.g. Alexis Carter"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-4 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-primary text-sm transition-colors"
                placeholder="alexis@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-4 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-primary text-sm transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-4 py-3 rounded-xl outline-none focus:border-primary text-sm transition-colors cursor-pointer"
            >
              <option value="Analyst">Analyst (Read-only predictions/reports)</option>
              <option value="Admin">Admin (Full access + CRUD + Settings)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all duration-200"
          >
            {submitting ? 'Registering Account...' : (
              <>
                Create Account
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs">
          <span className="text-slate-500">Already registered? </span>
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
