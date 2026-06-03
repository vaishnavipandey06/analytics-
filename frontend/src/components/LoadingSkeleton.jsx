import React from 'react';

export const KPISkeleton = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
      <div className="flex justify-between items-start">
        <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
      <div className="w-2/3 h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="flex gap-2">
        <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
      <div className="w-1/3 h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-end justify-between p-4 space-x-2">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-md" style={{ height: '35%' }}></div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-md" style={{ height: '65%' }}></div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-md" style={{ height: '45%' }}></div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-md" style={{ height: '85%' }}></div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-md" style={{ height: '55%' }}></div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-md" style={{ height: '70%' }}></div>
      </div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-1/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="w-1/3 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-850">
            <div className="w-1/6 h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="w-1/4 h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="w-1/6 h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="w-1/12 h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="w-1/12 h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default { KPISkeleton, ChartSkeleton, TableSkeleton };
