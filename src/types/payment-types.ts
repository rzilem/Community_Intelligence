// Enhanced payment system types aligned with database schema

export interface PaymentMethod {
  id: string;
  resident_id: string;
  association_id: string;
  payment_type: 'ach' | 'card' | 'bank_transfer';
  account_number_last_four: string;
  routing_number?: string;
  bank_name?: string;
  card_type?: string;
  expiry_date?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  property_id: string;
  association_id: string;
  amount: number;
  net_amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: 'assessment' | 'late_fee' | 'other';
  description?: string;
  fees?: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionCase {
  id: string;
  association_id: string;
  property_id: string;
  case_number: string;
  total_amount_owed: number;
  current_balance: number;
  original_balance: number;
  case_status: 'open' | 'closed' | 'suspended' | 'settled';
  collection_stage: 'initial' | 'notice' | 'demand' | 'legal' | 'judgment';
  opened_date: string;
  last_action_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionAction {
  id: string;
  case_id: string;
  action_type: string;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  amount?: number;
  outcome?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  performed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AutoPaySetting {
  id: string;
  resident_id: string;
  association_id: string;
  payment_method_id?: string;
  is_enabled: boolean;
  process_day: number;
  amount_type: 'full_balance' | 'fixed_amount' | 'minimum_due';
  fixed_amount?: number;
  next_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentBatch {
  id: string;
  association_id: string;
  batch_number: string;
  payment_method: 'ach' | 'check' | 'wire';
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
  total_amount: number;
  total_count: number;
  payment_count: number;
  batch_date: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  property_id: string;
  association_id: string;
  amount: number;
  net_amount: number;
  fees?: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: 'assessment' | 'late_fee' | 'other';
  description?: string;
  batch_id?: string;
  created_at: string;
  updated_at: string;
}

// GL Account types for advanced features
export interface GLAccount {
  id: string;
  association_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category?: string;
  parent_account_id?: string;
  is_active: boolean;
  balance: number;
  normal_balance: 'debit' | 'credit';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  association_id: string;
  entry_number: string;
  entry_date: string;
  reference?: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  source_type: 'manual' | 'ap' | 'ar' | 'bank' | 'assessment';
  created_by?: string;
  posted_by?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLineItem {
  id: string;
  journal_entry_id: string;
  gl_account_id: string;
  line_number: number;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  created_at: string;
  updated_at: string;
}