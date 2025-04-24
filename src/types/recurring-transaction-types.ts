
export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  last_generated_date?: string;
  next_generation_date?: string;
  is_active: boolean;
  gl_account_id?: string;
  category?: string;
  association_id?: string;
}

export interface RecurringTransactionFormData extends Omit<RecurringTransaction, 'id'> {}
