import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiSettings, FiSliders, FiActivity, FiShield, FiRefreshCw, FiCheck } from 'react-icons/fi';

const Settings = () => {
  const { user, API_URL } = useAuth();
  const [settings, setSettings] = useState({
    churnThreshold: 80,
    emailNotifications: true,
    defaultModel: 'rf',
    theme: 'dark',
    alertEmail: 'admin@churnvision.com'
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'Admin';

  const fetchData = async () => {
    try {
      const settingsRes = await axios.get(`${API_URL}/settings`);
      if (settingsRes.data.status === 'success') {
        setSettings(settingsRes.data.settings);
      }

      if (isAdmin) {
        const logsRes = await axios.get(`${API_URL}/settings/logs`);
        if (logsRes.data.status === 'success') {
          setLogs(logsRes.data.logs);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setError('');
    setMessage('');
    setUpdating(true);

    try {
      const res = await axios.put(`${API_URL}/settings`, settings);
      if (res.data.status === 'success') {
        setSettings(res.data.settings);
        setMessage('Platform settings updated successfully.');
        fetchData(); // Refresh audit logs
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleRetrain = async () => {
    if (!isAdmin) return;

    setError('');
    setMessage('');
    setRetraining(true);

    try {
      const res = await axios.post(`${API_URL}/ml/retrain`);
      if (res.data.status === 'success') {
        setMessage(`Models retrained successfully! New Accuracy: RF: ${(res.data.metrics.rf_accuracy * 100).toFixed(1)}%, LR: ${(res.data.metrics.lr_accuracy * 100).toFixed(1)}%`);
        fetchData(); // Refresh audit logs
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Flask ML service is offline. Retraining aborted.');
    } finally {
      setRetraining(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading configurations...</div>;
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Configurations</h2>
        <p className="text-slate-400 text-xs">Configure risk alarms, retrain predictive models, and review logs.</p>
      </div>

      {message && (
        <div className="p-4 bg-success-light/10 text-success border border-success-light/35 text-xs rounded-xl flex items-center gap-2">
          <FiCheck className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger-light/10 text-danger border border-danger-light/35 text-xs rounded-xl flex items-center gap-2">
          <FiShield className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 h-fit">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiSliders className="text-primary" /> Parameters & Thresholds
          </h4>

          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <fieldset disabled={!isAdmin} className="space-y-4">
              {/* Threshold */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  High Risk Alarm Threshold ({settings.churnThreshold}%)
                </label>
                <input
                  type="range"
                  name="churnThreshold"
                  min="50"
                  max="95"
                  value={settings.churnThreshold}
                  onChange={handleInputChange}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Alert triggers when a customer prediction exceeds this score.</span>
              </div>

              {/* Default Model */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Default Classifier Model</label>
                <select
                  name="defaultModel"
                  value={settings.defaultModel}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary cursor-pointer"
                >
                  <option value="rf">Random Forest Classifier (Default)</option>
                  <option value="lr">Logistic Regression Classifier</option>
                </select>
              </div>

              {/* Email Notification Toggles */}
              <div className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                <div>
                  <h5 className="font-bold text-xs">Email Alerts</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Send alerts for high-risk customer thresholds.</p>
                </div>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:ring-2 accent-primary cursor-pointer"
                />
              </div>

              {/* Alert Email address */}
              {settings.emailNotifications && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alert Recipient Email</label>
                  <input
                    type="email"
                    name="alertEmail"
                    value={settings.alertEmail}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                    placeholder="admin@churnvision.com"
                    required
                  />
                </div>
              )}
            </fieldset>

            {isAdmin ? (
              <button
                type="submit"
                disabled={updating}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:shadow-lg shadow-primary/20 transition-all"
              >
                {updating ? 'Applying...' : 'Save Parameters'}
              </button>
            ) : (
              <div className="p-3 bg-warning-light/10 text-warning border border-warning-light/35 rounded-xl text-xs flex gap-2">
                <FiShield className="w-5 h-5 shrink-0" />
                <span>Modifications restricted. Only administrators can adjust system parameters.</span>
              </div>
            )}
          </form>
        </div>

        {/* Models retraining */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 h-fit">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiRefreshCw className="text-secondary" /> Retrain Pipelines
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Re-fit the model weights by feeding in the current customer profiles in the active database.
          </p>

          <button
            onClick={handleRetrain}
            disabled={retraining || !isAdmin}
            className="w-full bg-gradient-to-r from-secondary to-indigo-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {retraining ? 'Recalculating...' : (
              <>
                <FiRefreshCw className="animate-spin-slow" /> Fit Model Pipelines
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      {isAdmin && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiActivity className="text-success" /> System Audit Trail (Last 50 actions)
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Executed By</th>
                  <th className="py-3 px-4">Origin IP</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No events logged in the audit trail.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id || log._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-primary">{log.action}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{log.details}</td>
                      <td className="py-3.5 px-4 font-semibold">{log.username}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
