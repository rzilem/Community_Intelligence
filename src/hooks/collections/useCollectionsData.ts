
import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';

export interface CollectionAccount {
  id: string;
  property_id: string;
  resident_id: string;
  balance_amount: number;
  delinquent_since: string;
  status: string;
  last_payment_date: string | null;
  last_payment_amount: number | null;
  property?: {
    address: string;
    unit_number?: string;
  };
  resident?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface CollectionStep {
  id: string;
  association_id: string;
  name: string;
  description: string | null;
  days_after_delinquent: number;
  step_order: number;
  step_type: string;
  is_automated: boolean;
  order_no?: number;
  send_to?: string;
  reply_to?: string;
  portal_reply?: string;
  is_closing_step?: boolean;
}

export interface CollectionDocument {
  id: string;
  collections_account_id: string;
  step_id: string;
  document_name: string;
  document_url: string;
  sent_date: string | null;
  opened_date: string | null;
  status: string;
}

export interface CollectionPaymentPlan {
  id: string;
  collections_account_id: string;
  plan_type: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  monthly_amount: number;
  status: string;
  notes?: string;
  created_by: string;
}

export interface CollectionPayment {
  id: string;
  collections_account_id: string;
  payment_plan_id?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  status: string;
  notes?: string;
}

export function useCollectionsData(associationId: string) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const { data: accounts, isLoading: accountsLoading } = useSupabaseQuery<CollectionAccount[]>(
    'collections_accounts',
    {
      select: `
        *,
        property:properties(address, unit_number),
        resident:residents(name, email, phone)
      `,
      filter: [{ column: 'association_id', value: associationId }],
      order: { column: 'delinquent_since', ascending: false }
    }
  );

  const { data: steps, isLoading: stepsLoading } = useSupabaseQuery<CollectionStep[]>(
    'collections_steps',
    {
      select: '*',
      filter: [{ column: 'association_id', value: associationId }],
      order: { column: 'step_order', ascending: true }
    }
  );

  const { data: history } = useSupabaseQuery(
    'collections_account_history',
    {
      select: '*',
      filter: [
        { column: 'collections_account_id', value: selectedAccount }
      ],
      order: { column: 'action_date', ascending: false }
    },
    !!selectedAccount
  );

  const { data: documents } = useSupabaseQuery<CollectionDocument[]>(
    'collections_account_documents',
    {
      select: '*',
      filter: [
        { column: 'collections_account_id', value: selectedAccount }
      ],
      order: { column: 'created_at', ascending: false }
    },
    !!selectedAccount
  );

  const { data: paymentPlans } = useSupabaseQuery<CollectionPaymentPlan[]>(
    'collections_payment_plans',
    {
      select: '*',
      filter: [
        { column: 'collections_account_id', value: selectedAccount }
      ],
      order: { column: 'created_at', ascending: false }
    },
    !!selectedAccount
  );

  const { data: payments } = useSupabaseQuery<CollectionPayment[]>(
    'collections_payments',
    {
      select: '*',
      filter: [
        { column: 'collections_account_id', value: selectedAccount }
      ],
      order: { column: 'payment_date', ascending: false }
    },
    !!selectedAccount
  );

  return {
    accounts: accounts || [],
    steps: steps || [],
    history: history || [],
    documents: documents || [],
    paymentPlans: paymentPlans || [],
    payments: payments || [],
    isLoading: accountsLoading || stepsLoading,
    selectedAccount,
    setSelectedAccount,
  };
}
