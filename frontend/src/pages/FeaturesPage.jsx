import React from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiShield, FiTrendingUp, FiCheck, FiFolder, FiBell, FiSettings } from 'react-icons/fi';

const FeaturesPage = () => {
  const features = [
    {
      title: 'Random Forest & Logistic Regression Models',
      desc: 'Our Flask microservice hosts two machine learning algorithms. It calculates churn likelihood using parameters such as age, subscription type, support tickets, usage frequency, and monthly charges.',
      icon: <FiCpu className="w-5 h-5" />,
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'JWT Authentication & Role Access Control',
      desc: 'Strict route protection ensures security. The platform uses JSON Web Tokens (JWT) for session management, separating operations between Admin roles (CRUD, settings changes, retraining) and Analyst roles.',
      icon: <FiShield className="w-5 h-5" />,
      color: 'bg-secondary/10 text-secondary'
    },
    {
      title: 'Executive PDF & Excel Report Exports',
      desc: 'Generate business intelligence spreadsheets and PDFs containing clean layouts of key performance indicators, risk categories, location graphs, and data lists.',
      icon: <FiTrendingUp className="w-5 h-5" />,
      color: 'bg-success/10 text-success'
    },
    {
      title: 'Dynamic Notification Alerts',
      desc: 'Real-time alert notifications trigger when customer risk exceeds 80%, new signups register, revenue drops, or monthly trends cross alert thresholds.',
      icon: <FiBell className="w-5 h-5" />,
      color: 'bg-danger/10 text-danger'
    },
    {
      title: 'Full MERN Stack Clean Architecture',
      desc: 'Modular folder structure splitting backend controllers, routers, database schemas, and frontend view containers. Clean components facilitate testing and maintenance.',
      icon: <FiFolder className="w-5 h-5" />,
      color: 'bg-amber-500/10 text-amber-500'
    },
    {
      title: 'Actionable AI Retention Engine',
      desc: 'Provides automated retention advice on customer cards (e.g., loyalty rewards, support follow-ups, re-engagement emails) based on indicators.',
      icon: <FiSettings className="w-5 h-5" />,
      color: 'bg-emerald-500/10 text-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-xl">
            C
          </div>
          <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CHURNVISION
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="text-sm font-semibold hover:text-primary transition-colors py-2">
            Back to Home
          </Link>
          <Link to="/login" className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-xl font-bold text-sm">
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight">Platform Specifications & Capabilities</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
            Explore the core technical architecture and machine learning frameworks that power ChurnVision's business intelligence suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <div key={index} className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.color}`}>
                {feat.icon}
              </div>
              <h4 className="text-lg font-bold">{feat.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-4xl mx-auto space-y-6">
          <h3 className="text-2xl font-bold">Ready to analyze customer churn metrics?</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Log in to access dashboards, cohort analytics, model performance evaluations, and the automated AI action planners.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-primary/25 transition-all">
            Launch Platform
          </Link>
        </div>
      </main>
    </div>
  );
};

export default FeaturesPage;
