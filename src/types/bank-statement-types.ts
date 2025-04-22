
export interface BankStatement {
  id: string;
  bank_account_id: string;
  statement_date: string;
  file_url?: string;
  filename?: string;
  file_size?: number;
  import_status: string;
  balance_ending?: number;
  uploaded_at?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}
