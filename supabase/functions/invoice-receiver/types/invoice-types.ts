
// Define the Invoice interface for use within the edge function
export interface Invoice {
  id?: string;
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
  email_content?: string;
  source_document?: string;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  payment_date?: string;
  gl_account_id?: string;
  bank_account_id?: string;
  from?: string;
}

// Define the Attachment interface
export interface Attachment {
  filename: string;
  contentType: string;
  content: string | Blob | File | Uint8Array;
  size: number;
  url?: string;
  source_document?: string;
}
