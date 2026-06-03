import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiTerminal, FiDatabase, FiGrid } from 'react-icons/fi';

const AboutPage = () => {
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

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight">About ChurnVision Platform</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
            ChurnVision is designed as a template for business intelligence dashboards. It combines classical MERN stacks (MongoDB, Express, React, Node) with Python machine learning APIs to provide real-time metrics, risk forecasts, and action items.
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-slate-200 dark:border-slate-800 pb-3">Technical Stack Breakdown</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FiGrid className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">React Frontend (Vite)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Fast React application styled with Tailwind CSS v3. Custom layouts handle dashboard widgets, charts (via Recharts), and micro-animations (via Framer Motion).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <FiTerminal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Express Node API Server</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Boots custom routers for users, cohorts, logs, settings, and ML operations. Utilizes pdfkit and exceljs for downloads, and integrates a rule-based JS prediction engine as a local fallback when the Python Flask service is offline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                <FiDatabase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">MongoDB & Local Fallback</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Uses Mongoose ODM for schemas. If database access is unavailable, it automatically switches to an optimized file-based storage database located inside `backend/data/`.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <FiBookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Python Flask ML Microservice</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Runs standard inference pipelines. Validates and trains RandomForestClassifiers and LogisticRegression classifiers, exporting models to joblib serialize binaries.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <h4 className="font-bold text-sm">Deployment & Configuration Guides</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The platform is built to be deployable on Vercel (Frontend), Render (Backend & Python service), and MongoDB Atlas (Cloud database). System configs are driven by `.env` variables ensuring environments map smoothly.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
