import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiFileText, FiDownload, FiMail, FiCheck, FiSend } from 'react-icons/fi';

const Reports = () => {
  const { API_URL } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [email, setEmail] = useState('');
  const [reportType, setReportType] = useState('pdf');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleDownloadPDF = () => {
    window.open(`${API_URL}/reports/pdf?token=${localStorage.getItem('token')}`, '_blank');
  };

  const handleDownloadExcel = () => {
    window.open(`${API_URL}/reports/excel?token=${localStorage.getItem('token')}`, '_blank');
  };

  const handleShareReport = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please provide a recipient email address.');
      return;
    }

    setSharing(true);
    try {
      const res = await axios.post(`${API_URL}/reports/share`, { email, reportType });
      if (res.data.status === 'success') {
        setMessage(res.data.message);
        setEmail('');
      }
    } catch (err) {
      setError('Failed to dispatch report. Please verify mail endpoint.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Executive Exporters</h2>
        <p className="text-slate-400 text-xs">Generate custom PDF business summaries or download raw database spreadsheets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report downloads */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiFileText className="text-primary" /> Available Exporters
          </h4>

          <div className="space-y-4">
            {/* PDF Report card */}
            <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
              <div>
                <h5 className="font-bold text-xs">Executive Churn Report (PDF)</h5>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  KPI counters, top 10 churn-risk lists, and formatted diagrams.
                </p>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="bg-primary hover:bg-primary-dark text-white p-3 rounded-xl hover:shadow-lg transition-all"
                title="Download PDF"
              >
                <FiDownload className="w-5 h-5" />
              </button>
            </div>

            {/* Excel Report card */}
            <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
              <div>
                <h5 className="font-bold text-xs">Complete Cohorts Sheet (Excel)</h5>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Raw spreadsheets formatted and highlighted with warning indicators.
                </p>
              </div>
              <button
                onClick={handleDownloadExcel}
                className="bg-success hover:bg-success-dark text-white p-3 rounded-xl hover:shadow-lg transition-all"
                title="Download Excel"
              >
                <FiDownload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Share report */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiMail className="text-secondary" /> Dispatch Reports
          </h4>

          {error && (
            <div className="p-4 bg-danger-light/10 text-danger border border-danger-light/35 text-xs rounded-xl">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-success-light/10 text-success border border-success-light/35 text-xs rounded-xl flex items-center gap-2">
              <FiCheck className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleShareReport} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                placeholder="colleague@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Report Template</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs cursor-pointer focus:border-primary"
              >
                <option value="pdf">Executive PDF Report</option>
                <option value="excel">Complete Excel Sheet</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sharing}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
            >
              {sharing ? 'Dispatching...' : (
                <>
                  <FiSend /> Email Document
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reports;
