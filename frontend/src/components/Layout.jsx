import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FiBarChart2, FiUsers, FiPieChart, FiCpu, FiDownload, 
  FiSettings, FiUser, FiLogOut, FiBell, FiSun, FiMoon, FiMenu, FiX 
} from 'react-icons/fi';

const Layout = ({ children }) => {
  const { user, logout, API_URL } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark' || !('theme' in localStorage));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Apply dark mode class to html element
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      if (res.data.status === 'success') {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.notifications.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiBarChart2 className="w-5 h-5" /> },
    { name: 'Customers', path: '/customers', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <FiPieChart className="w-5 h-5" /> },
    { name: 'Churn Prediction', path: '/prediction', icon: <FiCpu className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <FiDownload className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
    { name: 'User Profile', path: '/profile', icon: <FiUser className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/30">
            C
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CHURNVISION
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Predictive Suite</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* User Display */}
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-primary">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{user?.name || 'User Profile'}</h4>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-primary px-2 py-0.5 rounded-full font-bold">
                {user?.role || 'Analyst'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors duration-200"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-white dark:bg-darkbg-card h-full shadow-2xl p-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
                  C
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CHURNVISION</h1>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-semibold">Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-darkbg/40 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h2 className="hidden md:block text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {navItems.find(item => item.path === location.pathname)?.name || 'Platform Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 text-slate-500 dark:text-slate-400"
              title="Toggle Theme"
            >
              {dark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Notification Drawer Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 text-slate-500 dark:text-slate-400 relative"
                title="System Notifications"
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-danger text-[10px] text-white flex items-center justify-center rounded-full font-bold border border-white dark:border-darkbg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-xl z-50 py-3 flex flex-col max-h-[480px]">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-150 dark:border-slate-800/80">
                    <span className="font-bold text-sm">Notifications ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/40">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No alerts or system notifications.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id || notif._id} 
                          className={`p-4 transition-colors ${!notif.read ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}
                        >
                          <div className="flex gap-2">
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              notif.type === 'danger' ? 'bg-danger' : 
                              notif.type === 'warning' ? 'bg-warning' : 
                              notif.type === 'success' ? 'bg-success' : 'bg-primary'
                            }`} />
                            <div className="flex-1">
                              <h5 className="text-xs font-bold leading-tight">{notif.title}</h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{notif.message}</p>
                              <span className="text-[9px] text-slate-400 block mt-2">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Portal */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
