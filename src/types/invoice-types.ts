
export interface Invoice {
  id: string;
  tracking_number?: string;
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
  source_document?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceFilterOptions {
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
  vendor?: string;
  association_id?: string;
  startDate?: string;
  endDate?: string;
  source?: 'email' | 'document' | 'all';
}

export interface InvoiceDocument {
  name: string;
  type: string;
  size: number;
  content: string;
}

export type InvoiceSource = 'email' | 'document' | 'manual';

export interface CommunicationLog {
  id: string;
  tracking_number: string;
  communication_type: 'invoice' | 'lead' | 'email' | 'message' | 'workflow';
  metadata: Record<string, any>;
  received_at: string;
  processed_at?: string;
  status: 'received' | 'processing' | 'completed' | 'failed';
}
