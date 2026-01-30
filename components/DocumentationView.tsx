import React from 'react';

const DocumentationView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Validation Rules Documentation</h1>
        <p className="text-slate-500 mt-1">Reference guide for data quality standards.</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-8 space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">1. Numeric & Non-Negative Costs</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700"><strong>Requirement:</strong> Cost fields must be numeric and ≥ 0</p>
          </div>
          <p className="text-slate-600 mb-2">Costs cannot be text (e.g., "TBD", "N/A") or negative numbers. Zero is allowed.</p>
          <ul className="list-disc ml-5 text-slate-600 text-sm space-y-1">
            <li><strong>Pass:</strong> 1250.50, 0, 0.01</li>
            <li><strong>Fail:</strong> "TBD", -500.00, (blank)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">2. No Duplicate Entries</h2>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
             <p className="text-sm text-amber-700"><strong>Requirement:</strong> Same Order + CLIN + WBS should not appear multiple times</p>
          </div>
          <p className="text-slate-600">Prevents double-counting. If you have valid duplicates, ensure they have distinguishing details or consolidate them.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">3. WBS Roll-Up Consistency</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
             <p className="text-sm text-red-700"><strong>Requirement:</strong> Child WBS costs must not exceed parent WBS totals</p>
          </div>
          <p className="text-slate-600">The sum of all children (e.g., 1.1.1 + 1.1.2) must be ≤ Parent (1.1). A 1% tolerance is allowed for rounding.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">4. Extreme Cost Outliers</h2>
            <p className="text-slate-600 mb-2">Flags costs that are >3 standard deviations from the mean of their WBS group.</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Warning Only</p>
        </section>

         <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">5. One-Time Large Costs</h2>
            <p className="text-slate-600 mb-2">Flags single large costs (>$100K) in a WBS that appear to be one-time events.</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Warning Only</p>
        </section>

      </div>
    </div>
  );
};
export default DocumentationView;