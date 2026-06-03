import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiCpu, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      {/* Top Banner Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary/20">
            C
          </div>
          <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CHURNVISION
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/about" className="hidden md:inline text-sm font-semibold hover:text-primary transition-colors">
            About Project
          </Link>
          <Link to="/features" className="hidden md:inline text-sm font-semibold hover:text-primary transition-colors">
            Features
          </Link>
          <Link to="/login" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-bold text-sm transition-all duration-200">
            Sign In
          </Link>
          <Link to="/register" className="hidden sm:inline bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-primary border border-indigo-150 dark:border-indigo-950 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase">
            🚀 Machine Learning & Churn Intelligence
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Predict Churn.{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Retain Revenue.
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
            ChurnVision is an enterprise-grade AI intelligence platform that detects warning signs, predicts customer attrition risks using advanced algorithms, and recommends high-impact retention strategies.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/register" className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-bold text-base hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2 group transition-all duration-200">
              Launch Dashboard
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/features" className="px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-bold text-base transition-all duration-200">
              Explore Features
            </Link>
          </div>
        </motion.div>

        {/* Right graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Background decorative glows */}
          <div className="absolute -top-12 -left-12 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-10" />
          <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] -z-10" />

          {/* Graphic Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-semibold uppercase tracking-wider">
                Risk Assessor v1.0
              </span>
            </div>

            <div className="space-y-6 pt-6">
              {/* Profile Card Mock */}
              <div className="flex items-center justify-between bg-slate-100/40 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-primary">
                    MC
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Marcus Cooper</h4>
                    <span className="text-[11px] text-slate-400">Basic Plan | 3 months tenure</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    High Risk
                  </span>
                  <p className="text-sm font-extrabold text-danger mt-1">84.2% Risk</p>
                </div>
              </div>

              {/* Chart Mock */}
              <div className="h-44 flex items-end justify-between gap-2 px-2 pt-2 border-b border-slate-200 dark:border-slate-800">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg h-[80%] transition-all hover:bg-primary/50" />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg h-[60%] transition-all hover:bg-primary/50" />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg h-[40%] transition-all hover:bg-primary/50" />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg h-[70%] transition-all hover:bg-primary/50" />
                <div className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg h-[90%] neon-glow-primary" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-2 uppercase tracking-wide">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May (Current)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust & Features Section */}
      <section className="bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/80 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl font-extrabold tracking-tight">Designed for Modern Operations</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Equip your analyst and executive teams with production-ready AI pipelines, dynamic cohort filters, and fully automated retention alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FiCpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Predictive ML Classifiers</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Utilize Random Forest and Logistic Regression trained models with detailed feature importance analysis and confidence scorings.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <FiShield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Role-Based Access Guard</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Enforce security protocols via JWT, restricting critical edits, deletions, configurations and retraining models to Admin accounts.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Executive PDF & Excel Reporting</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Download styled data grids, summaries, and executive outlines at the touch of a button. Instantly dispatch to stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 ChurnVision. Built with React, Tailwind, Express, and Flask ML. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
