import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { forgotPassword } = useAuth();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    setSubmitting(true);
    const res = await forgotPassword(email);
    setSubmitting(false);

    if (res.success) {
      setSuccess('A password recovery link has been generated. Since SMTP is simulated in dev mode, you can immediately reset credentials below.');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors">
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
          <h2 className="text-2xl font-bold pt-2">Recover Password</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Enter your registered email address below, and we will dispatch a secure validation credential link.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-danger-light/10 text-danger border border-danger-light/35 text-xs rounded-xl">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-success-light/10 text-success border border-success-light/35 text-xs rounded-xl flex gap-3">
              <FiCheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">Recovery Link Dispatched</h5>
                <p className="mt-1 leading-snug">{success}</p>
              </div>
            </div>
            <Link
              to={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3.5 rounded-xl font-bold text-sm block text-center hover:shadow-lg transition-all"
            >
              Go to Reset Password Screen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg disabled:opacity-50 transition-all duration-200"
            >
              {submitting ? 'Generating link...' : 'Send Recovery Credentials'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
