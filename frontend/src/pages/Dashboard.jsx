import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { 
  FiUsers, FiUserCheck, FiUserMinus, FiTrendingUp, 
  FiDollarSign, FiAward, FiActivity, FiArrowUpRight, FiArrowDownRight 
} from 'react-icons/fi';
import { KPISkeleton, ChartSkeleton } from '../components/LoadingSkeleton';

const Dashboard = () => {
  const { API_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers/kpis`);
      if (res.data.status === 'success') {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <KPISkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};

  // Curated color palette
  const COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];
  const SEGM_COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Low, Med, High risk

  const cards = [
    {
      title: 'Total Customers',
      value: kpis.totalCustomers || 0,
      icon: <FiUsers className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/10',
      trend: `${kpis.monthlyGrowth || 4.2}%`,
      trendUp: true,
      desc: 'vs last month'
    },
    {
      title: 'Active Customers',
      value: kpis.activeCustomers || 0,
      icon: <FiUserCheck className="w-5 h-5 text-success" />,
      bg: 'bg-success/10',
      trend: '+2.8%',
      trendUp: true,
      desc: 'engagement index stable'
    },
    {
      title: 'Churned Customers',
      value: kpis.churnedCustomers || 0,
      icon: <FiUserMinus className="w-5 h-5 text-danger" />,
      bg: 'bg-danger/10',
      trend: '-1.4%',
      trendUp: false,
      desc: 'since last period'
    },
    {
      title: 'Churn Rate',
      value: `${kpis.churnRate || 0}%`,
      icon: <FiActivity className="w-5 h-5 text-warning" />,
      bg: 'bg-warning/10',
      trend: 'Target < 15%',
      trendUp: (kpis.churnRate || 0) < 15,
      desc: 'overall attrition likelihood'
    },
    {
      title: 'Monthly Revenue Loss',
      value: `$${(kpis.revenueLoss || 0).toLocaleString()}`,
      icon: <FiDollarSign className="w-5 h-5 text-danger" />,
      bg: 'bg-danger/10',
      trend: '12.4% of total',
      trendUp: false,
      desc: 'active leak value'
    },
    {
      title: 'Customer Lifetime Value',
      value: `$${(kpis.customerLifetimeValue || 0).toLocaleString()}`,
      icon: <FiAward className="w-5 h-5 text-success" />,
      bg: 'bg-success/10',
      trend: '+5.3%',
      trendUp: true,
      desc: 'average contract metrics'
    },
    {
      title: 'Retention Rate',
      value: `${kpis.retentionRate || 0}%`,
      icon: <FiTrendingUp className="w-5 h-5 text-success" />,
      bg: 'bg-success/10',
      trend: 'Target > 85%',
      trendUp: (kpis.retentionRate || 0) > 85,
      desc: 'active retention quota'
    },
    {
      title: 'Monthly Active Revenue',
      value: `$${(kpis.monthlyRevenueActive || 0).toLocaleString()}`,
      icon: <FiDollarSign className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/10',
      trend: '+6.1%',
      trendUp: true,
      desc: 'contracted monthly ARR'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Executive Control Panel</h2>
          <p className="text-slate-400 text-xs">Real-time cohort insights, attrition warnings, and predictive metrics.</p>
        </div>
        <div className="text-xs text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          Last refreshed: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                {card.icon}
              </div>
            </div>
            <div className="my-4">
              <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-0.5 font-bold ${card.trendUp ? 'text-success' : 'text-danger'}`}>
                {card.trendUp ? <FiArrowUpRight /> : <FiArrowDownRight />}
                {card.trend}
              </span>
              <span className="text-slate-400 truncate">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Impact Over Time */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Revenue Impact Analysis</h4>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Area type="monotone" dataKey="revenueLoss" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorLoss)" name="Monthly Revenue Loss ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn by Age Group */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Attrition by Age Group</h4>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.churnByAge || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="churnRate" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Churn Rate (%)">
                  {(charts.churnByAge || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn by Subscription Plan */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Churn by Subscription Plan</h4>
          <div className="h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.churnByPlan || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="churned"
                    nameKey="name"
                  >
                    {(charts.churnByPlan || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Churned`, 'Plan']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 flex flex-col space-y-2 mt-4 sm:mt-0 px-4">
              {(charts.churnByPlan || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">
                    {item.churned} churned ({item.churnRate}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Churn by Region & Customer Risk Segmentation */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Cohort Risk Segmentation (Active Customers)</h4>
          <div className="h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.customerSegmentation || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                  >
                    {(charts.customerSegmentation || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEGM_COLORS[index % SEGM_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 flex flex-col space-y-2 mt-4 sm:mt-0 px-4">
              {(charts.customerSegmentation || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SEGM_COLORS[idx % SEGM_COLORS.length] }} />
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">
                    {item.value} customers
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
