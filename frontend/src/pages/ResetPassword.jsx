import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all security fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const res = await resetPassword(email, password);
    setSubmitting(false);

    if (res.success) {
      setSuccess('Your password has been successfully reset! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors">
            <FiArrowLeft className="w-3.5 h-3.5" /> Cancel and return
          </Link>
          <h2 className="text-2xl font-bold pt-2">Set New Password</h2>
          <p className="text-slate-400 text-xs">Enter your verification email and new password credentials below.</p>
        </div>

        {error && (
          <div className="p-4 bg-danger-light/10 text-danger border border-danger-light/35 text-xs rounded-xl">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-success-light/10 text-success border border-success-light/35 text-xs rounded-xl flex items-center gap-2">
            <FiCheck className="w-6 h-6 shrink-0" />
            <span>{success}</span>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Account Email</label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-primary text-sm transition-colors"
                  placeholder="analyst@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-primary text-sm transition-colors"
                  placeholder="Min 6 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-primary text-sm transition-colors"
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg disabled:opacity-50 transition-all duration-200"
            >
              {submitting ? 'Resetting password...' : 'Save and Apply Credentials'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
