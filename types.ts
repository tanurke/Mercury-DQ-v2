export enum ValidationSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  PASS = 'PASS'
}

export interface CostRow {
  id: number;
  OrderOrLot_ID: string;
  CLIN_ID: string;
  WBSElement_ID: string;
  ActualToDate_Dollars: string | number; // Can be string if "TBD"
  Description?: string;
}

export interface ValidationIssue {
  id: string;
  ruleId: number;
  rowId: number;
  severity: ValidationSeverity;
  column: string;
  message: string;
  remediation: string;
}

export interface ValidationResult {
  passed: boolean;
  totalRows: number;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  rows: CostRow[];
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  VALIDATING = 'VALIDATING',
  RESULTS = 'RESULTS',
  SUBMITTED = 'SUBMITTED'
}

export type View = 'dashboard' | 'submissions' | 'documentation';

export interface Submission {
  id: string;
  date: string;
  filename: string;
  status: 'Submitted' | 'Rejected' | 'Draft';
  rows: number;
  errors: number;
  warnings: number;
  acknowledged: boolean;
  validationResult?: ValidationResult; // Optional: stores the full detail for re-viewing
}