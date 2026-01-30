import React, { useState } from 'react';
import { ValidationIssue, ValidationSeverity } from '../types';

interface Props {
  issues: ValidationIssue[];
  onRowClick: (rowId: number) => void;
}

const IssueList: React.FC<Props> = ({ issues, onRowClick }) => {
  const [filter, setFilter] = useState<'ALL' | 'ERROR' | 'WARNING'>('ALL');

  const filteredIssues = issues.filter(issue => 
    filter === 'ALL' || issue.severity === filter
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
        <h3 className="font-semibold text-slate-800">Validation Issues</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
          >
            All ({issues.length})
          </button>
          <button 
            onClick={() => setFilter('ERROR')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === 'ERROR' ? 'bg-red-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-red-50'}`}
          >
            Errors ({issues.filter(i => i.severity === ValidationSeverity.ERROR).length})
          </button>
          <button 
             onClick={() => setFilter('WARNING')}
             className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === 'WARNING' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-amber-50'}`}
          >
            Warnings ({issues.filter(i => i.severity === ValidationSeverity.WARNING).length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0 custom-scrollbar max-h-[500px]">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No issues found with this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredIssues.map((issue) => (
              <div 
                key={issue.id} 
                onClick={() => onRowClick(issue.rowId)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
                      ${issue.severity === ValidationSeverity.ERROR ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}
                    `}>
                      {issue.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500">Row {issue.rowId}</span>
                    <span className="text-xs font-mono text-slate-400">Rule {issue.ruleId}</span>
                  </div>
                </div>
                
                <p className="mt-2 text-sm font-medium text-slate-900 group-hover:text-gov-700">
                  {issue.message}
                </p>
                <div className="mt-1 text-xs text-slate-500 flex gap-1">
                  <span className="font-semibold">Fix:</span> 
                  <span>{issue.remediation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueList;