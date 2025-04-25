
export interface Transaction {
  id: string;
  date: string;
  description: string;
  property: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  glAccount: string;
  associationId?: string;
}

export interface Payment {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  status: 'scheduled' | 'processed' | 'failed' | 'pending';
  method: 'check' | 'ach' | 'credit' | 'wire';
  associationName: string;
  category: string;
  associationId?: string;
  invoiceId?: string; // Link to the invoice
  scheduledDate?: string;
  processedDate?: string;
  notes?: string;
}

export interface TransactionTableProps {
  transactions: Transaction[];
}

export interface PaymentFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
}
