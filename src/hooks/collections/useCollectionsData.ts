
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
  name: string;
  description: string | null;
  days_after_delinquent: number;
  step_order: number;
  step_type: string;
  is_automated: boolean;
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

  return {
    accounts: accounts || [],
    steps: steps || [],
    history: history || [],
    isLoading: accountsLoading || stepsLoading,
    selectedAccount,
    setSelectedAccount,
  };
}
