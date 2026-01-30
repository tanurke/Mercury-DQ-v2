import React, { useCallback, useState } from 'react';
import { AppState } from '../types';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  appState: AppState;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, appState }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  }, [onFileUpload]);

  if (appState === AppState.UPLOADING || appState === AppState.VALIDATING) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gov-600 mb-4"></div>
        <h3 className="text-xl font-semibold text-slate-800">
            {appState === AppState.UPLOADING ? 'Uploading File...' : 'Running Validation Rules...'}
        </h3>
        <p className="text-slate-500 mt-2">Checking against 5 data quality rules</p>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center h-96 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
        ${isDragging ? 'border-gov-500 bg-gov-50' : 'border-slate-300 bg-white hover:border-gov-400 hover:bg-slate-50'}
      `}
    >
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
      />
      
      <div className="bg-gov-100 p-4 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gov-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Cost Data</h3>
      <p className="text-slate-500 mb-6 text-center max-w-sm">
        Drag and drop your Excel file here, or click to browse.
        <br/><span className="text-xs text-slate-400">(Supports .xlsx, .csv - Max 50MB)</span>
      </p>

      <div className="bg-white border border-slate-200 px-4 py-2 rounded-md shadow-sm text-sm font-medium text-slate-700">
        Browse Files
      </div>
    </div>
  );
};

export default FileUpload;