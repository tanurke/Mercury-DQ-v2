import React, { useState, useEffect } from 'react';
import { AppState, ValidationResult, Submission } from '../types';
import FileUpload from './FileUpload';
import ValidationSummary from './ValidationSummary';
import IssueList from './IssueList';
import DataPreview from './DataPreview';
import { generateDynamicMockData } from '../services/mockDataService';
import { validateData } from '../services/validationService';

interface ValidationDashboardProps {
  submissions: Submission[];
  onAddSubmission: (submission: Submission) => void;
  selectedSubmission?: Submission | null;
  onClearSelection?: () => void;
  onViewHistory?: () => void;
}

const ValidationDashboard: React.FC<ValidationDashboardProps> = ({ 
  submissions,
  onAddSubmission, 
  selectedSubmission, 
  onClearSelection,
  onViewHistory
}) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  
  // Track the previous upload to support "Smart Retry"
  // If user uploads 'budget.xlsx' and it fails, then uploads 'budget.xlsx' again immediately,
  // we assume they fixed the file and force a clean generation.
  const [lastUploadState, setLastUploadState] = useState<{name: string, outcome: 'pass' | 'fail'} | null>(null);

  // Effect to load submission if provided (View Mode)
  useEffect(() => {
    if (selectedSubmission && selectedSubmission.validationResult) {
      setResults(selectedSubmission.validationResult);
      setAppState(AppState.RESULTS);
      setCurrentFileName(selectedSubmission.filename);
      setAcknowledged(selectedSubmission.acknowledged);
    } else if (!selectedSubmission) {
      if (appState === AppState.RESULTS && !results) {
          setAppState(AppState.IDLE);
      }
    }
  }, [selectedSubmission]);

  const handleFileUpload = async (file: File) => {
    if (onClearSelection) onClearSelection();

    const fileName = file.name;
    setCurrentFileName(fileName);
    setAppState(AppState.UPLOADING);
    setResults(null); 
    setSelectedRowId(null);
    
    // Smart Retry Logic
    let forceClean = false;
    
    // 1. If filename explicitly says 'clean' or 'v2', trust the mock service (it handles those).
    // 2. Otherwise, check our history:
    if (lastUploadState && lastUploadState.name === fileName && lastUploadState.outcome === 'fail') {
       // User is retrying the same file that just failed -> Assume they fixed it.
       forceClean = true;
    }

    setTimeout(async () => {
      setAppState(AppState.VALIDATING);
      
      const rows = generateDynamicMockData(fileName, forceClean);
      const validationResults = await validateData(rows);
      
      setResults(validationResults);
      setAppState(AppState.RESULTS);

      // Update history for next time
      setLastUploadState({
          name: fileName,
          outcome: validationResults.passed ? 'pass' : 'fail'
      });
    }, 1000);
  };

  const handleReupload = () => {
    if (onClearSelection) onClearSelection();
    setAppState(AppState.IDLE);
    setResults(null);
    setAcknowledged(false);
    setCurrentFileName("");
    setSelectedRowId(null);
  };

  const handleSubmit = () => {
    if (results) {
      // Automatic Versioning Logic
      let displayFileName = currentFileName;
      
      const lastDotIndex = currentFileName.lastIndexOf('.');
      const nameWithoutExt = lastDotIndex !== -1 ? currentFileName.substring(0, lastDotIndex) : currentFileName;
      const ext = lastDotIndex !== -1 ? currentFileName.substring(lastDotIndex) : '';

      // Check existing submissions for this filename pattern
      let maxVersion = 0;
      let hasExactMatch = false;

      submissions.forEach(sub => {
        if (sub.filename === currentFileName) {
          hasExactMatch = true;
          maxVersion = Math.max(maxVersion, 1);
        } else if (sub.filename.startsWith(nameWithoutExt + '_v') && sub.filename.endsWith(ext)) {
          // Parse "Name_v2.xlsx"
          const versionPart = sub.filename.substring(nameWithoutExt.length + 2, sub.filename.length - ext.length);
          const ver = parseInt(versionPart, 10);
          if (!isNaN(ver)) {
            maxVersion = Math.max(maxVersion, ver);
          }
        }
      });

      if (hasExactMatch || maxVersion > 0) {
        // If we found any previous history, increment the version
        displayFileName = `${nameWithoutExt}_v${maxVersion + 1}${ext}`;
      }

      const timestamp = Date.now().toString().slice(-6);
      const newSubmission: Submission = {
        id: `SUB-2026-${timestamp}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        filename: displayFileName,
        status: results.errorCount > 0 ? 'Rejected' : 'Submitted',
        rows: results.totalRows,
        errors: results.errorCount,
        warnings: results.warningCount,
        acknowledged: acknowledged,
        validationResult: results
      };
      onAddSubmission(newSubmission);
      setAppState(AppState.SUBMITTED);
      
      // Reset smart retry state on successful submission so next file starts fresh
      if (results.errorCount === 0) {
          setLastUploadState(null);
      }
    }
  };

  if (appState === AppState.SUBMITTED) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className={`p-10 rounded-2xl shadow-lg text-center max-w-md w-full border border-slate-200 ${results && results.errorCount > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${results && results.errorCount > 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
            {results && results.errorCount > 0 ? (
               <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            ) : (
               <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
            )}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${results && results.errorCount > 0 ? 'text-red-800' : 'text-slate-800'}`}>
            {results && results.errorCount > 0 ? 'Submission Recorded (with Errors)' : 'Submission Successful!'}
          </h2>
          <p className="text-slate-500 mb-8">
            {results && results.errorCount > 0 
              ? 'Your file has been uploaded but marked as Rejected due to validation errors. Please review the submission history.' 
              : 'Your cost data has been validated and securely transmitted to the government portal.'} 
          </p>
          <div className="space-y-3">
             <button 
                onClick={handleReupload}
                className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
              >
                Start New Submission
              </button>
              {onViewHistory && (
                <button 
                  onClick={onViewHistory}
                  className="w-full px-6 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors"
                >
                  View Submission History
                </button>
              )}
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = results ? (
    (results.passed && (results.warningCount === 0 || acknowledged)) ||
    (!results.passed)
  ) : false;

  const isViewMode = !!selectedSubmission;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Area */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Contractor Data Portal</h1>
          <p className="text-slate-500 mt-1">
            {isViewMode 
              ? `Viewing Submission: ${selectedSubmission.id} (${selectedSubmission.filename})`
              : 'Upload and validate your monthly cost reports (CDRL A001)'}
          </p>
        </div>
        
        {appState === AppState.RESULTS && (
          <div className="flex gap-3">
            <button 
              onClick={handleReupload}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm"
            >
              {isViewMode ? 'Upload New Version' : 'Upload New File'}
            </button>
            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm flex items-center shadow-sm">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Report
            </button>
          </div>
        )}
      </div>

      {appState === AppState.IDLE || appState === AppState.UPLOADING || appState === AppState.VALIDATING ? (
        <FileUpload onFileUpload={handleFileUpload} appState={appState} />
      ) : (
        results && (
          <div className="space-y-6">
            {isViewMode && (
                <div className={`p-4 rounded-lg border flex items-center justify-between ${selectedSubmission.status === 'Rejected' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center">
                         <span className={`font-bold mr-2 ${selectedSubmission.status === 'Rejected' ? 'text-red-700' : 'text-emerald-700'}`}>
                             {selectedSubmission.status.toUpperCase()}
                         </span>
                         <span className="text-slate-600 text-sm">
                             on {selectedSubmission.date}
                         </span>
                    </div>
                </div>
            )}
            <ValidationSummary results={results} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              <div className="lg:col-span-1 h-full">
                <IssueList issues={results.issues} onRowClick={setSelectedRowId} />
              </div>

              <div className="lg:col-span-2 h-full">
                <DataPreview 
                  rows={results.rows} 
                  issues={results.issues} 
                  highlightedRowId={selectedRowId} 
                />
              </div>
            </div>

            {!isViewMode && (
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-4 sm:-mx-8 lg:-mx-8 px-8 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center">
                  {results.warningCount > 0 && results.passed && (
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-gov-600 rounded border-slate-300 focus:ring-gov-500" 
                        checked={acknowledged}
                        onChange={(e) => setAcknowledged(e.target.checked)}
                      />
                      <span className="text-sm text-slate-700">
                        I acknowledge {results.warningCount} warnings and confirm data accuracy.
                      </span>
                    </label>
                  )}
                  {!results.passed && (
                      <span className="text-red-600 font-medium text-sm flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Submitting with critical errors will mark submission as Rejected.
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`
                    px-8 py-2.5 rounded-lg font-semibold shadow-sm transition-all
                    ${!canSubmit
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : !results.passed 
                          ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
                          : 'bg-gov-600 text-white hover:bg-gov-700 hover:shadow-md'
                    }
                  `}
                >
                  {!results.passed ? 'Submit with Errors' : 'Submit Data'}
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default ValidationDashboard;