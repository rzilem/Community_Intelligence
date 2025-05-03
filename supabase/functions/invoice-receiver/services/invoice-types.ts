
export interface Attachment {
  filename?: string;
  contentType: string;
  content: string | Blob | File;
  size?: number;
  url?: string;
  source_document?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  tracking_number?: string;
  vendor: string;
  amount: number;
  invoice_date?: string;
  due_date?: string;
  status: string;
  pdf_url?: string;
  source_document?: string;
  html_content?: string;
  email_content?: string;
  description?: string;
  association_id?: string;
  association_name?: string;
  created_at: string;
  updated_at: string;
}
