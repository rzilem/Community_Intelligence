import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';

export const useBalanceSheet = () => {
  const { currentAssociation } = useAuth();
  const associationId = currentAssociation?.id;
  const { data, isLoading, error } = useSupabaseQuery<any[]>(
    'v_balance_sheet',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : undefined,
    },
    !!associationId
  );

  return { data: data || [], isLoading, error };
};
