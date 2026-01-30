import React, { useEffect, useRef } from 'react';
import { CostRow, ValidationIssue, ValidationSeverity } from '../types';

interface Props {
  rows: CostRow[];
  issues: ValidationIssue[];
  highlightedRowId: number | null;
}

const DataPreview: React.FC<Props> = ({ rows, issues, highlightedRowId }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  // Helper to get issue for specific cell
  const getCellIssue = (rowId: number, column: string) => {
    return issues.find(i => i.rowId === rowId && (i.column === column || i.column === 'Multiple'));
  };

  // Helper to get max severity for a row
  const getRowSeverity = (rowId: number) => {
    const rowIssues = issues.filter(i => i.rowId === rowId);
    if (rowIssues.some(i => i.severity === ValidationSeverity.ERROR)) return ValidationSeverity.ERROR;
    if (rowIssues.some(i => i.severity === ValidationSeverity.WARNING)) return ValidationSeverity.WARNING;
    return ValidationSeverity.PASS;
  };

  // Scroll to highlighted row
  useEffect(() => {
    if (highlightedRowId !== null) {
      const el = rowRefs.current.get(highlightedRowId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary flash effect
        el.classList.add('bg-gov-50');
        setTimeout(() => el.classList.remove('bg-gov-50'), 2000);
      }
    }
  }, [highlightedRowId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
        <h3 className="font-semibold text-slate-800">Data Preview (First {rows.length} rows)</h3>
      </div>
      <div className="overflow-auto custom-scrollbar flex-1 max-h-[500px]" ref={tableRef}>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Row</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order/Lot</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CLIN</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">WBS Element</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actual Cost ($)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {rows.map((row) => {
              const severity = getRowSeverity(row.id);
              let rowClass = '';
              if (severity === ValidationSeverity.ERROR) rowClass = 'bg-red-50 hover:bg-red-100';
              else if (severity === ValidationSeverity.WARNING) rowClass = 'bg-amber-50 hover:bg-amber-100';
              else rowClass = 'hover:bg-slate-50';

              if (highlightedRowId === row.id) {
                 rowClass += ' ring-2 ring-inset ring-gov-500';
              }

              return (
                <tr 
                  key={row.id} 
                  className={`transition-colors duration-150 ${rowClass}`}
                  ref={el => {
                    if (el) rowRefs.current.set(row.id, el);
                    else rowRefs.current.delete(row.id);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">{row.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{row.OrderOrLot_ID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{row.CLIN_ID}</td>
                  
                  {/* WBS Cell */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getCellIssue(row.id, 'WBSElement_ID') ? 'text-red-700 font-bold decoration-red-500 underline decoration-wavy' : 'text-slate-700'}`}>
                    {row.WBSElement_ID}
                  </td>

                  {/* Cost Cell */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono 
                    ${getCellIssue(row.id, 'ActualToDate_Dollars') ? 'text-red-700 font-bold decoration-red-500 underline decoration-wavy' : 'text-slate-700'}
                  `}>
                    {typeof row.ActualToDate_Dollars === 'number' 
                      ? row.ActualToDate_Dollars.toLocaleString('en-US', { minimumFractionDigits: 2 }) 
                      : row.ActualToDate_Dollars}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 italic truncate max-w-xs">{row.Description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPreview;