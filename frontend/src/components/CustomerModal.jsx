import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';

const CustomerModal = ({ isOpen, onClose, onSubmit, customer = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Male',
    location: '',
    subscriptionPlan: 'Basic',
    monthlyCharges: '',
    tenure: '',
    supportTickets: '0',
    usageFrequency: '10'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        age: customer.age || '',
        gender: customer.gender || 'Male',
        location: customer.location || '',
        subscriptionPlan: customer.subscriptionPlan || 'Basic',
        monthlyCharges: customer.monthlyCharges || '',
        tenure: customer.tenure || '',
        supportTickets: customer.supportTickets?.toString() || '0',
        usageFrequency: customer.usageFrequency?.toString() || '10'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        age: '',
        gender: 'Male',
        location: '',
        subscriptionPlan: 'Basic',
        monthlyCharges: '',
        tenure: '',
        supportTickets: '0',
        usageFrequency: '10'
      });
    }
    setError('');
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.location.trim()) {
      setError('Please fill in all text fields.');
      return;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      setError('Please enter a valid age.');
      return;
    }
    if (!formData.monthlyCharges || parseFloat(formData.monthlyCharges) < 0) {
      setError('Monthly charges must be positive.');
      return;
    }
    if (formData.tenure === '' || parseInt(formData.tenure) < 0) {
      setError('Tenure must be zero or positive.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit customer data. Please verify fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative glass-panel rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 z-10">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold">
            {customer ? '✏️ Edit Customer Profile' : '👤 Add New Customer'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6 pt-6">
          {error && (
            <div className="p-4 bg-danger-light/10 text-danger border border-danger-light/35 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm"
                placeholder="e.g. Alexis Carter"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm"
                placeholder="alexis@example.com"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm"
                placeholder="32"
                min="18"
                max="120"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location/Region</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm"
                placeholder="e.g. North, Central, West"
                required
              />
            </div>

            {/* Subscription Plan */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subscription Plan</label>
              <select
                name="subscriptionPlan"
                value={formData.subscriptionPlan}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm cursor-pointer"
              >
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            {/* Monthly Charges */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monthly Charges ($)</label>
              <input
                type="number"
                name="monthlyCharges"
                value={formData.monthlyCharges}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm"
                placeholder="49.99"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tenure (Months)</label>
              <input
                type="number"
                name="tenure"
                value={formData.tenure}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm"
                placeholder="14"
                min="0"
                required
              />
            </div>

            {/* Support Tickets */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Support Tickets</label>
              <input
                type="number"
                name="supportTickets"
                value={formData.supportTickets}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Usage Frequency */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Logins/Usage per Month</label>
              <input
                type="number"
                name="usageFrequency"
                value={formData.usageFrequency}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors text-sm"
                placeholder="15"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all duration-200"
            >
              {saving ? 'Processing...' : (
                <>
                  <FiCheck className="w-5 h-5" />
                  Save Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
