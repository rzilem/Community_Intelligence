
export interface Invoice {
  id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  html_content?: string;
  pdf_url?: string;
  source_document?: string;
  invoice_number: string;
  vendor: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  description?: string;
  from?: string;
}
