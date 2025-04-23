
export interface Budget {
  id: string;
  name: string;
  year: string;
  status: 'draft' | 'approved' | 'final';
  totalRevenue: number;
  totalExpenses: number;
  createdBy: string;
  createdAt: string;
  description: string;
  associationId: string;
  fundType: 'operating' | 'reserve' | 'capital';
  entries?: BudgetEntry[];
}

export interface BudgetEntry {
  id: string;
  glAccountId: string;
  monthlyAmounts: MonthlyAmount[];
  annualTotal: number;
  previousYearActual?: number;
  previousYearBudget?: number;
  notes?: string;
  budget_id?: string; // Kept for compatibility
}

export interface MonthlyAmount {
  month: number;
  amount: number;
}

export interface GLAccount {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Income' | 'Expense';
  category?: string;
  balance?: number;
  is_active: boolean;
  association_id?: string;
  account_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GLAccountGroup {
  id: string;
  code: string;
  name: string;
  accounts: GLAccount[];
  isExpanded: boolean;
  totalBudget: number;
  totalPreviousYear: number;
  change: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; 
  entryDate: string;
  date: string; // For compatibility
  reference: string; // For compatibility
  description: string;
  status: 'draft' | 'posted' | 'voided';
  postDate?: string;
  amount: number;
  debitAccountId?: string;
  creditAccountId?: string;
  debitAccount?: GLAccount;
  creditAccount?: GLAccount;
  associationId: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
  attachments?: any[];
}

export interface ReportCategory {
  title: string;
  reports: string[];
}

export interface BudgetPrediction {
  glAccountId: string;
  suggestedAmount: number;
  reasoning: string;
  confidence: number;
  sources?: string[];
}

export interface BudgetSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  changeFromLastYear: number;
  changePercentage: number;
  insights: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  description?: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'voided';
  paymentDate?: string;
  associationId: string;
  glAccountId?: string;
  bankAccountId?: string;
  trackingNumber?: string;
  paymentMethod?: string;
  pdfUrl?: string;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description?: string;
  amount: number;
  glAccountId?: string;
  bankAccountId?: string;
}
