import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ValidationResult } from '../types';

interface Props {
  results: ValidationResult;
}

const ValidationSummary: React.FC<Props> = ({ results }) => {
  const passingRows = results.totalRows - results.errorCount; // Simplified logic for demo
  
  const data = [
    { name: 'Passing', value: passingRows, color: '#10b981' }, // emerald-500
    { name: 'Errors', value: results.errorCount, color: '#ef4444' }, // red-500
    { name: 'Warnings', value: results.warningCount, color: '#f59e0b' }, // amber-500
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Overall Status Card */}
      <div className={`p-6 rounded-lg shadow-sm border-l-4 ${results.passed ? 'bg-white border-emerald-500' : 'bg-white border-red-500'}`}>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Validation Status</h3>
        <div className="mt-2 flex items-baseline">
          <span className={`text-2xl font-bold ${results.passed ? 'text-emerald-600' : 'text-red-600'}`}>
            {results.passed ? 'PASSED' : 'FAILED'}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {results.passed 
            ? 'Ready for submission' 
            : 'Critical errors must be fixed'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
         <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Rows</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-1">{results.totalRows}</h4>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
               <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
         <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Errors</p>
              <h4 className="text-2xl font-bold text-red-600 mt-1">{results.errorCount}</h4>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
               <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
         <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Warnings</p>
              <h4 className="text-2xl font-bold text-amber-500 mt-1">{results.warningCount}</h4>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
               <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ValidationSummary;