
export interface Invoice {
  id: string;
  invoice_number: string;
  vendor: string;
  amount: number;
  due_date: string;
  invoice_date: string;
  description?: string;
  association_id?: string;
  association_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  html_content?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceFilterOptions {
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
  vendor?: string;
  association_id?: string;
  startDate?: string;
  endDate?: string;
}
