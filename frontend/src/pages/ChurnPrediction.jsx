import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { FiCpu, FiAlertCircle, FiSettings, FiCheckSquare, FiAward, FiInfo } from 'react-icons/fi';

const ChurnPrediction = () => {
  const { API_URL } = useAuth();
  const [modelType, setModelType] = useState('rf'); // rf or lr
  const [inputs, setInputs] = useState({
    age: '35',
    monthlyCharges: '65',
    tenure: '8',
    subscriptionPlan: 'Basic',
    supportTickets: '3',
    usageFrequency: '6'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        age: parseInt(inputs.age),
        monthlyCharges: parseFloat(inputs.monthlyCharges),
        tenure: parseInt(inputs.tenure),
        subscriptionPlan: inputs.subscriptionPlan,
        supportTickets: parseInt(inputs.supportTickets),
        usageFrequency: parseInt(inputs.usageFrequency),
        modelType
      };

      const res = await axios.post(`${API_URL}/ml/predict`, payload);
      if (res.data.status === 'success') {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while contacting the model server.');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Churn Risk Simulator</h2>
          <p className="text-slate-400 text-xs">Run real-time scenario evaluations using Random Forest or Logistic Regression pipelines.</p>
        </div>
        
        {/* Model selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setModelType('rf')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modelType === 'rf' 
                ? 'bg-white dark:bg-darkbg-card text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            Random Forest (Ensemble)
          </button>
          <button
            onClick={() => setModelType('lr')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modelType === 'lr' 
                ? 'bg-white dark:bg-darkbg-card text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            Logistic Regression
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-6 h-fit">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FiSettings className="text-primary" /> Simulator Inputs
          </h4>
          
          <form onSubmit={handlePredict} className="space-y-4">
            {/* Age */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={inputs.age}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                min="18" max="100" required
              />
            </div>

            {/* Subscription type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Plan Type</label>
              <select
                name="subscriptionPlan"
                value={inputs.subscriptionPlan}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs cursor-pointer focus:border-primary"
              >
                <option value="Basic">Basic Plan</option>
                <option value="Standard">Standard Plan</option>
                <option value="Premium">Premium Plan</option>
              </select>
            </div>

            {/* Monthly Charges */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Charges ($)</label>
              <input
                type="number"
                name="monthlyCharges"
                value={inputs.monthlyCharges}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                min="1" max="500" required
              />
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tenure (Months)</label>
              <input
                type="number"
                name="tenure"
                value={inputs.tenure}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                min="0" max="100" required
              />
            </div>

            {/* Support Tickets */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Support Tickets</label>
              <input
                type="number"
                name="supportTickets"
                value={inputs.supportTickets}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                min="0" max="20" required
              />
            </div>

            {/* Usage Frequency */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Logins/Month</label>
              <input
                type="number"
                name="usageFrequency"
                value={inputs.usageFrequency}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary"
                min="0" max="31" required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Evaluating Model...' : (
                <>
                  <FiCpu /> Calculate Risk Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Outputs */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-danger-light/10 text-danger border border-danger-light/35 rounded-xl text-xs flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!result && !loading && (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm text-center flex flex-col items-center justify-center space-y-4 h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <FiInfo className="w-8 h-8" />
              </div>
              <h5 className="font-bold text-sm">Simulator Awaiting Commands</h5>
              <p className="text-slate-400 text-xs max-w-sm">
                Enter simulated customer parameters in the panel on the left and run analysis.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm text-center flex flex-col items-center justify-center space-y-4 h-full min-h-[400px] animate-pulse">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
              <h5 className="font-bold text-sm">Running Forward-Inference Predictors</h5>
              <p className="text-slate-400 text-xs">Evaluating weights, scaler values, and decision thresholds...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Prob */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Churn Probability</span>
                  <h3 className={`text-3xl font-extrabold ${
                    result.prediction.riskLevel === 'High Risk' ? 'text-danger' : 
                    result.prediction.riskLevel === 'Medium Risk' ? 'text-warning' : 'text-success'
                  }`}>
                    {result.prediction.churnProbability}%
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">calculated likelihood</span>
                </div>

                {/* Risk Category */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Attrition Risk Category</span>
                  <h3 className="text-xl font-extrabold flex items-center justify-center h-9 mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      result.prediction.riskLevel === 'High Risk' ? 'bg-danger/10 text-danger border border-danger/25' : 
                      result.prediction.riskLevel === 'Medium Risk' ? 'bg-warning/10 text-warning border border-warning/25' : 
                      'bg-success/10 text-success border border-success/25'
                    }`}>
                      {result.prediction.riskLevel}
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">risk classification</span>
                </div>

                {/* Confidence */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Model Confidence</span>
                  <h3 className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">
                    {result.prediction.confidenceScore}%
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold truncate block">
                    via {result.prediction.modelUsed}
                  </span>
                </div>
              </div>

              {/* Feature Importance Recharts */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Feature Importance Analysis
                </h4>
                <div className="h-44 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.featureImportance || []}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 30, bottom: 0 }}
                    >
                      <XAxis type="number" stroke="#94A3B8" />
                      <YAxis dataKey="feature" type="category" stroke="#94A3B8" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Weight Contribution']} />
                      <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                        {(result.featureImportance || []).map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Retention Recommendations */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FiAward className="text-secondary" /> AI Action Recommendations
                </h4>
                
                <div className="space-y-4">
                  {/* Analysis Explanation */}
                  <div className="p-4 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Attrition Rationale</h5>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350">
                      {result.aiRecommendation?.analysis || 'No concerns detected.'}
                    </p>
                  </div>

                  {/* Actions checklist */}
                  <div>
                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Suggested Retention Tasks</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(result.aiRecommendation?.actions || []).map((action, idx) => (
                        <div key={idx} className="flex gap-2.5 p-3 rounded-xl border border-indigo-100 dark:border-indigo-950/45 bg-indigo-50/20 dark:bg-indigo-950/5">
                          <FiCheckSquare className="text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug font-medium">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChurnPrediction;
