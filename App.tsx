import React, { useState, useEffect } from 'react';
import ValidationDashboard from './components/ValidationDashboard';
import SubmissionsView from './components/SubmissionsView';
import DocumentationView from './components/DocumentationView';
import { View, Submission } from './types';
import { generateErrorMockData, generateCleanMockData } from './services/mockDataService';
import { validateData } from './services/validationService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Hydrate mock data with validation results so "View Report" works immediately
  useEffect(() => {
    const initMockData = async () => {
      // 1. Generate result for a 'bad' submission (Rejected)
      const errorRows = generateErrorMockData();
      const errorResult = await validateData(errorRows);
      
      // 2. Generate result for a 'good' submission (Submitted)
      const cleanRows = generateCleanMockData();
      const cleanResult = await validateData(cleanRows);
      
      const initialSubmissions: Submission[] = [
        { 
            id: 'SUB-2026-X90', 
            date: '2026-01-28 10:15', 
            filename: 'Cost_Report_Jan26_v1.xlsx', 
            status: 'Rejected', 
            rows: errorResult.totalRows, 
            errors: errorResult.errorCount, 
            warnings: errorResult.warningCount, 
            acknowledged: false,
            validationResult: errorResult // Attach detailed error result
        },
        { 
            id: 'SUB-2026-X91', 
            date: '2026-01-28 14:30', 
            filename: 'Cost_Report_Jan26_v2.xlsx', 
            status: 'Submitted', 
            rows: cleanResult.totalRows, 
            errors: cleanResult.errorCount, 
            warnings: cleanResult.warningCount, 
            acknowledged: true,
            validationResult: cleanResult // Attach clean result
        },
      ];
      setSubmissions(initialSubmissions);
    };
    initMockData();
  }, []);

  const handleAddSubmission = (submission: Submission) => {
    setSubmissions(prev => [submission, ...prev]);
  };

  const handleViewSubmission = (id: string) => {
      const sub = submissions.find(s => s.id === id);
      if (sub) {
          setSelectedSubmission(sub);
          setCurrentView('dashboard');
      }
  };

  const handleClearSelection = () => {
      setSelectedSubmission(null);
  };

  const handleNavClick = (view: View) => {
      setCurrentView(view);
      if (view !== 'dashboard') {
          setSelectedSubmission(null);
      }
  };

  const getLinkClass = (view: View) => {
    return currentView === view
      ? "border-gov-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-default"
      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavClick('dashboard')}>
                <div className="w-8 h-8 bg-gov-600 rounded mr-2 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gov-600 to-gov-800">
                  Mercury DQ
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button onClick={() => handleNavClick('dashboard')} className={getLinkClass('dashboard')}>
                  Dashboard
                </button>
                <button onClick={() => handleNavClick('submissions')} className={getLinkClass('submissions')}>
                  Submissions
                </button>
                <button onClick={() => handleNavClick('documentation')} className={getLinkClass('documentation')}>
                  Documentation
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                   <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-slate-900">Acme Defense Corp.</p>
                      <p className="text-xs text-slate-500">Vendor Analyst</p>
                   </div>
                   <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
                      AD
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {currentView === 'dashboard' && (
            <ValidationDashboard 
                submissions={submissions}
                onAddSubmission={handleAddSubmission} 
                selectedSubmission={selectedSubmission}
                onClearSelection={handleClearSelection}
                onViewHistory={() => handleNavClick('submissions')}
            />
        )}
        {currentView === 'submissions' && (
            <SubmissionsView 
                submissions={submissions} 
                onViewSubmission={handleViewSubmission} 
            />
        )}
        {currentView === 'documentation' && <DocumentationView />}
      </main>
    </div>
  );
};

export default App;