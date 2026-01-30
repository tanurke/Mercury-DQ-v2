import React from 'react';
import { Submission } from '../types';

interface SubmissionsViewProps {
    submissions: Submission[];
    onViewSubmission: (id: string) => void;
}

const SubmissionsView: React.FC<SubmissionsViewProps> = ({ submissions, onViewSubmission }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Submission History</h1>
        <p className="text-slate-500 mt-1">View and track past data submissions.</p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reference ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Rows</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Quality</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{sub.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sub.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sub.filename}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${sub.status === 'Submitted' ? 'bg-emerald-100 text-emerald-800' : 
                      sub.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{sub.rows}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                   {sub.errors === 0 ? (
                       <span className="text-emerald-600 font-bold">100%</span>
                   ) : (
                       <span className="text-red-600 font-bold">{(100 - (sub.errors/sub.rows)*100).toFixed(0)}%</span>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button 
                        onClick={() => onViewSubmission(sub.id)}
                        className="text-gov-600 hover:text-gov-800 font-medium"
                    >
                        View Report
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default SubmissionsView;