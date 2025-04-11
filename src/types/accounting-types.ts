
export interface ReportCategory {
  title: string;
  reports: string[];
}

export interface GLAccount {
  id: string;
  number: string;
  name: string;
  type: string;
  balance: number;
  code: string;
  description: string;
  category: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  status: 'draft' | 'posted' | 'reconciled';
  createdBy: string;
  createdAt: string;
  associationId?: string;
}
