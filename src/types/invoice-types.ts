
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
  pdf_url?: string;
  email_content?: string; // Optional email content field
  source_document?: string;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  payment_date?: string;
  gl_account_id?: string;
  bank_account_id?: string;
  ai_confidence?: Record<string, number> | null;
  ai_processing_status?: string | null;
  ai_processed_at?: string | null;
  ai_line_items?: any[] | null;
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
  created_at?: string;
  updated_at?: string;
}

export interface Attachment {
  filename: string;
  contentType: string;
  content: string | Blob | File | Uint8Array;
  size: number;
  url?: string;
  source_document?: string;
}
