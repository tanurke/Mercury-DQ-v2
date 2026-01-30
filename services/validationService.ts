import { CostRow, ValidationIssue, ValidationResult, ValidationSeverity } from '../types';

// Helper to check if value is numeric
const isNumeric = (n: any) => !isNaN(parseFloat(n)) && isFinite(n);

export const validateData = (rows: CostRow[]): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      const issues: ValidationIssue[] = [];
      let errorCount = 0;
      let warningCount = 0;

      // --- Rule 1: Numeric & Non-Negative Cost ---
      rows.forEach(row => {
        const cost = row.ActualToDate_Dollars;
        if (!isNumeric(cost)) {
          issues.push({
            id: `r1-${row.id}-${Date.now()}`, // Ensure unique issue ID
            ruleId: 1,
            rowId: row.id,
            severity: ValidationSeverity.ERROR,
            column: 'ActualToDate_Dollars',
            message: `Found "${cost}" in cost field.`,
            remediation: 'Replace with numeric value or remove row.'
          });
          errorCount++;
        } else if (typeof cost === 'number' && cost < 0) {
          issues.push({
            id: `r1-${row.id}-${Date.now()}`,
            ruleId: 1,
            rowId: row.id,
            severity: ValidationSeverity.ERROR,
            column: 'ActualToDate_Dollars',
            message: `Negative cost found: ${cost}.`,
            remediation: 'Verify cost is non-negative.'
          });
          errorCount++;
        }
      });

      // --- Rule 2: Duplicate Cost Entries ---
      const seen = new Map<string, number[]>();
      rows.forEach(row => {
        const key = `${row.OrderOrLot_ID}-${row.CLIN_ID}-${row.WBSElement_ID}`;
        if (!seen.has(key)) seen.set(key, []);
        seen.get(key)?.push(row.id);
      });

      seen.forEach((ids, key) => {
        if (ids.length > 1) {
          ids.forEach(id => {
            issues.push({
              id: `r2-${id}-${Date.now()}`,
              ruleId: 2,
              rowId: id,
              severity: ValidationSeverity.WARNING,
              column: 'Multiple (Key Combination)',
              message: `Duplicate entry for key: ${key}`,
              remediation: 'Consolidate into single row or add distinguishing detail.'
            });
            warningCount++;
          });
        }
      });

      // --- Rule 3: WBS Roll-Up Consistency ---
      // 1. Group by parent WBS (Simplified logic: Assumes x.x is parent of x.x.x)
      const wbsMap = new Map<string, { cost: number, childrenCost: number }>();
      
      // First pass: Build map
      rows.forEach(row => {
        if (typeof row.ActualToDate_Dollars === 'number' && row.ActualToDate_Dollars >= 0) {
           const wbs = row.WBSElement_ID;
           if (!wbsMap.has(wbs)) wbsMap.set(wbs, { cost: 0, childrenCost: 0 });
           const entry = wbsMap.get(wbs);
           if (entry) entry.cost += row.ActualToDate_Dollars;
        }
      });

      // Second pass: Aggregate children to parents
      wbsMap.forEach((_, wbs) => {
         // Check if this WBS is a child of another (e.g., 3.1.1 is child of 3.1)
         const parts = wbs.split('.');
         if (parts.length > 2) {
            const parentWbs = parts.slice(0, -1).join('.');
            if (wbsMap.has(parentWbs)) {
                const parentEntry = wbsMap.get(parentWbs);
                const childEntry = wbsMap.get(wbs);
                if (parentEntry && childEntry) {
                    parentEntry.childrenCost += childEntry.cost;
                }
            }
         }
      });

      // Third pass: Validate
      wbsMap.forEach((data, wbs) => {
          // Only validate if it actually has children (cost accumulation happened)
          if (data.childrenCost > 0) {
              const tolerance = data.cost * 0.01; // 1% tolerance
              if (data.childrenCost > (data.cost + tolerance)) {
                  // Find the row ID for this parent WBS to attach error
                  const parentRow = rows.find(r => r.WBSElement_ID === wbs);
                  if (parentRow) {
                       issues.push({
                          id: `r3-${parentRow.id}-${Date.now()}`,
                          ruleId: 3,
                          rowId: parentRow.id,
                          severity: ValidationSeverity.ERROR,
                          column: 'WBSElement_ID',
                          message: `Child costs ($${data.childrenCost}) exceed parent WBS total ($${data.cost}).`,
                          remediation: 'Verify parent cost includes all child costs.'
                       });
                       errorCount++;
                  }
              }
          }
      });

      // --- Rule 4 & 5: Outliers & One-Time Costs ---
      // Group costs by WBS
      const wbsCosts = new Map<string, number[]>();
      rows.forEach(row => {
         if (typeof row.ActualToDate_Dollars === 'number') {
             const wbs = row.WBSElement_ID;
             if (!wbsCosts.has(wbs)) wbsCosts.set(wbs, []);
             wbsCosts.get(wbs)?.push(row.ActualToDate_Dollars);
         }
      });

      wbsCosts.forEach((costs, wbs) => {
          if (costs.length >= 3) {
              const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
              const variance = costs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / costs.length;
              const stdDev = Math.sqrt(variance);

              // Rule 4: > 3 std deviations
              costs.forEach(cost => {
                  if (stdDev > 0 && Math.abs(cost - mean) > 3 * stdDev) {
                      const row = rows.find(r => r.WBSElement_ID === wbs && r.ActualToDate_Dollars === cost);
                      if (row) {
                          issues.push({
                              id: `r4-${row.id}-${Date.now()}`,
                              ruleId: 4,
                              rowId: row.id,
                              severity: ValidationSeverity.WARNING,
                              column: 'ActualToDate_Dollars',
                              message: `Cost $${cost} is an outlier (>3 SD from mean $${mean.toFixed(2)}).`,
                              remediation: 'Verify cost is accurate or add explanatory note.'
                          });
                          warningCount++;
                      }
                  }
              });
          }

          // Rule 5: Single large cost > $100k
          const largeCosts = costs.filter(c => c > 100000);
          if (largeCosts.length === 1) {
              const cost = largeCosts[0];
              const row = rows.find(r => r.WBSElement_ID === wbs && r.ActualToDate_Dollars === cost);
              if (row) {
                  issues.push({
                      id: `r5-${row.id}-${Date.now()}`,
                      ruleId: 5,
                      rowId: row.id,
                      severity: ValidationSeverity.WARNING,
                      column: 'ActualToDate_Dollars',
                      message: `Single large cost ($${cost}) detected in WBS.`,
                      remediation: 'Confirm if this is a one-time event.'
                  });
                  warningCount++;
              }
          }
      });


      resolve({
        passed: errorCount === 0,
        totalRows: rows.length,
        errorCount,
        warningCount,
        issues,
        rows
      });
    }, 1500); // Fake 1.5s delay
  });
};