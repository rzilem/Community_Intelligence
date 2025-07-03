import { Database } from '@/integrations/supabase/types';

export interface PaymentBatch {
  id: string;
  association_id: string;
  batch_number: string;
  payment_method: 'ach' | 'check' | 'wire';
  status: string;
  total_amount: number;
  total_count: number;
  payment_count: number; // Add missing property
  batch_date: string;
  created_by: string;
  approved_by?: string;
  processed_date?: string;
  ach_file_path?: string;
  bank_account_id?: string;
  file_generated?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendor1099Record {
  id: string;
  association_id: string;
  vendor_id?: string;
  vendor_name: string; // Add missing property
  vendor_tin: string; // Add missing property
  tax_year: number;
  total_amount: number;
  box_number: string;
  form_type: string;
  is_1099_required: boolean; // Add missing property
  status: string; // Add missing property
  corrections_count: number; // Add missing property
  form_generated: boolean;
  form_sent: boolean;
  backup_withholding: boolean;
  correction_filed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = Database['public']['Tables']['resident_payment_methods']['Row'];
export type PaymentTransaction = Database['public']['Tables']['payment_transactions_enhanced']['Row'];
export type CollectionCase = Database['public']['Tables']['collection_cases']['Row'];
export type CollectionAction = Database['public']['Tables']['collection_actions']['Row'];