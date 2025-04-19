
export interface BankStatement {
  id: string;
  bank_account_id: string;
  statement_date: string;
  filename?: string;
  file_url?: string;
  file_size?: number;
  upload_method: 'manual' | 'api';
  import_status: 'pending' | 'processing' | 'processed' | 'failed';
  balance_ending?: number;
  imported_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  statement_id: string;
  transaction_date: string;
  amount: number;
  description?: string;
  reference_number?: string;
  is_reconciled: boolean;
  reconciled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  name: string;
  account_number: string;
  routing_number?: string;
  account_type: string;
  bank_name: string;
  association_id?: string;
  last_statement_date?: string;
  last_reconciled_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BankStatementUploadResult {
  success: boolean;
  statement_id?: string;
  error?: string;
  transaction_count?: number;
}
