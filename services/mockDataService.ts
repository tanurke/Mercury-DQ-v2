import { CostRow } from '../types';

// --- SEEDED RANDOM NUMBER GENERATOR ---
// This ensures that "File_A.xlsx" always generates the exact same "random" data.

// Hash string to 32-bit integer
const cyrb128 = (str: string) => {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1^h2^h3^h4) >>> 0;
};

// Mulberry32 - Simple, fast seeded RNG
const mulberry32 = (a: number) => {
    return () => {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Global Descriptions
const DESCRIPTIONS = [
  'Project Management', 'System Engineering', 'Software Development', 'Hardware Integration',
  'Testing & QA', 'Documentation', 'Travel Expenses', 'Material Procurement', 
  'Consulting Services', 'Safety Compliance', 'Cloud Infrastructure', 'Data Analysis'
];

const WBS_ROOTS = ['1.0', '1.1', '1.2', '2.0', '2.1', '3.0', '3.1.1', '3.1.2', '4.0'];

export const generateDynamicMockData = (filename: string, forceClean: boolean = false): CostRow[] => {
  // 1. Create a Seed based on the filename
  const seed = cyrb128(filename);
  const rand = mulberry32(seed);

  // Helper to use our seeded rand
  const rndInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  // 2. Generate Deterministic Base Data
  const rowCount = rndInt(20, 50); 
  const batchId = rndInt(100, 999);
  const rows: CostRow[] = [];
  
  for (let i = 1; i <= rowCount; i++) {
    const wbs = pick(WBS_ROOTS);
    rows.push({
      id: i,
      OrderOrLot_ID: `LOT-${batchId}`,
      CLIN_ID: '0001',
      WBSElement_ID: wbs,
      ActualToDate_Dollars: rndInt(1000, 50000), 
      Description: pick(DESCRIPTIONS)
    });
  }

  // Determine if we should inject errors
  // Check filename keywords for "magic" behavior
  const lowerName = filename.toLowerCase();
  const isExplicitClean = lowerName.includes('clean') || lowerName.includes('valid') || lowerName.includes('fixed') || lowerName.includes('final');
  const isExplicitError = lowerName.includes('error') || lowerName.includes('fail') || lowerName.includes('bad');

  let shouldInjectErrors = !forceClean;

  if (isExplicitClean) shouldInjectErrors = false;
  if (isExplicitError) shouldInjectErrors = true;

  // By default, if not explicit, we inject errors to show off the tool
  // But if it looks like a version 2 (e.g., "report_v2.xlsx"), we reduce error chance or make it clean
  if (!isExplicitClean && !isExplicitError) {
      if (lowerName.includes('v2') || lowerName.includes('rev1')) {
         shouldInjectErrors = false; // Simulate a fix
      } else {
         shouldInjectErrors = true;
      }
  }

  if (!shouldInjectErrors) {
    return rows;
  }

  // 3. Inject Errors Deterministically (The same file will always have the same errors at the same rows)
  const errorCount = rndInt(2, 6);
  const usedIndices = new Set<number>();

  for (let k = 0; k < errorCount; k++) {
    let idx = rndInt(0, rows.length - 1);
    // Simple collision avoidance
    let attempts = 0;
    while (usedIndices.has(idx) && attempts < 10) {
       idx = rndInt(0, rows.length - 1);
       attempts++;
    }
    usedIndices.add(idx);
    
    const errorType = rndInt(1, 4);
    const row = rows[idx];

    switch (errorType) {
      case 1: // Rule 1: Non-Numeric
        row.ActualToDate_Dollars = "TBD";
        row.Description = "Pending Vendor Quote";
        break;
      case 2: // Rule 1: Negative Cost
        row.ActualToDate_Dollars = -1 * rndInt(500, 5000);
        row.Description = "Accounting Adjustment";
        break;
      case 3: // Rule 3: Child exceeds parent
        row.WBSElement_ID = "1.1.1"; 
        row.ActualToDate_Dollars = 999999; 
        row.Description = "Unexpected Overrun";
        break;
      case 4: // Rule 2: Duplicate
        const dup = { ...row, id: rows.length + 1, Description: row.Description + " (Duplicate)" };
        rows.push(dup);
        break;
    }
  }

  return rows;
};

// Legacy wrappers for App.tsx initialization
export const generateCleanMockData = () => generateDynamicMockData("clean_init_file.xlsx", true);
export const generateErrorMockData = () => generateDynamicMockData("error_init_file.xlsx", false);

export const generateMockData = generateDynamicMockData;