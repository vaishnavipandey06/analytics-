import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FiSearch, FiFilter, FiPlus, FiEdit, FiTrash2, 
  FiDownload, FiChevronLeft, FiChevronRight, FiAlertTriangle 
} from 'react-icons/fi';
import CustomerModal from '../components/CustomerModal';
import { TableSkeleton } from '../components/LoadingSkeleton';

const CustomerManagement = () => {
  const { user, API_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [churnStatus, setChurnStatus] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        location: location || undefined,
        subscriptionPlan: subscriptionPlan || undefined,
        riskLevel: riskLevel || undefined,
        churnStatus: churnStatus !== '' ? churnStatus : undefined
      };
      
      const res = await axios.get(`${API_URL}/customers`, { params });
      if (res.data.status === 'success') {
        setCustomers(res.data.customers);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, location, subscriptionPlan, riskLevel, churnStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (cust) => {
    setSelectedCustomer(cust);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (cust) => {
    const confirm = window.confirm(`Are you sure you want to delete customer ${cust.name} (${cust.customerId})?`);
    if (!confirm) return;

    try {
      const res = await axios.delete(`${API_URL}/customers/${cust.id || cust._id}`);
      if (res.data.status === 'success') {
        alert('Customer profile deleted successfully.');
        fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting customer');
    }
  };

  const handleModalSubmit = async (formData) => {
    if (selectedCustomer) {
      // Update
      const id = selectedCustomer.id || selectedCustomer._id;
      await axios.put(`${API_URL}/customers/${id}`, formData);
    } else {
      // Create
      await axios.post(`${API_URL}/customers`, formData);
    }
    fetchCustomers();
  };

  const handleExportClick = () => {
    window.open(`${API_URL}/customers/export?token=${localStorage.getItem('token')}`, '_blank');
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Database</h2>
          <p className="text-slate-400 text-xs">Search, filter, export customer details, and update predictions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
          
          {isAdmin ? (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:shadow-lg shadow-primary/20 transition-all duration-200"
            >
              <FiPlus className="w-4 h-4" />
              Add Customer
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/30">
              <FiAlertTriangle className="text-warning" />
              Analyst Role (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* Filters Dashboard */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full lg:w-96">
          <FiSearch className="absolute left-4 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by ID, Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 pl-11 pr-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary transition-colors"
          />
          <button type="submit" className="hidden" />
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {/* Plan */}
          <select
            value={subscriptionPlan}
            onChange={(e) => { setSubscriptionPlan(e.target.value); setPage(1); }}
            className="bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 px-3 py-2.5 rounded-xl outline-none text-xs cursor-pointer focus:border-primary"
          >
            <option value="">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>

          {/* Location */}
          <select
            value={location}
            onChange={(e) => { setLocation(e.target.value); setPage(1); }}
            className="bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 px-3 py-2.5 rounded-xl outline-none text-xs cursor-pointer focus:border-primary"
          >
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>

          {/* Risk Level */}
          <select
            value={riskLevel}
            onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
            className="bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 px-3 py-2.5 rounded-xl outline-none text-xs cursor-pointer focus:border-primary"
          >
            <option value="">All Risk Levels</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
          </select>

          {/* Churn Status */}
          <select
            value={churnStatus}
            onChange={(e) => { setChurnStatus(e.target.value); setPage(1); }}
            className="bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 px-3 py-2.5 rounded-xl outline-none text-xs cursor-pointer focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="0">Active</option>
            <option value="1">Churned</option>
          </select>
        </div>
      </div>

      {/* Database Data Grid Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/10">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Subscription</th>
                  <th className="py-4 px-6">Tenure</th>
                  <th className="py-4 px-6">Financials</th>
                  <th className="py-4 px-6">Tickets / Logs</th>
                  <th className="py-4 px-6">Risk Prediction</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  {isAdmin && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400 font-medium">
                      No matching customer accounts found in records.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => {
                    const id = cust.id || cust._id;
                    return (
                      <tr key={id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-sm">{cust.name}</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">{cust.customerId} • {cust.email}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{cust.age} yrs • {cust.gender} • {cust.location}</div>
                        </td>
                        <td className="py-4 px-6 font-medium">{cust.subscriptionPlan} Plan</td>
                        <td className="py-4 px-6 font-medium">{cust.tenure} months</td>
                        <td className="py-4 px-6">
                          <div>${cust.monthlyCharges}/mo</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">${cust.totalCharges} total</div>
                        </td>
                        <td className="py-4 px-6">
                          <div>{cust.supportTickets} tickets</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">{cust.usageFrequency} active days/mo</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              cust.riskLevel === 'High Risk' ? 'bg-danger' : 
                              cust.riskLevel === 'Medium Risk' ? 'bg-warning' : 'bg-success'
                            }`} />
                            <span className="font-bold">{cust.churnProbability}%</span>
                            <span className="text-slate-400 text-[10px]">({cust.riskLevel})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                            cust.churnStatus === 1 
                              ? 'bg-danger-light/10 text-danger border border-danger-light/35' 
                              : 'bg-success-light/10 text-success border border-success-light/35'
                          }`}>
                            {cust.churnStatus === 1 ? 'Churned' : 'Active'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleEditClick(cust)}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                title="Edit Customer"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(cust)}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-danger hover:border-danger-light transition-colors"
                                title="Delete Customer"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-xs font-medium">
                Showing Page {page} of {pages} ({total} entries)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Modal Component */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomerManagement;
