import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';

export const useTrialBalance = () => {
  const { currentAssociation } = useAuth();
  const associationId = currentAssociation?.id;
  const { data, isLoading, error } = useSupabaseQuery<any[]>(
    'v_trial_balance',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : undefined,
      order: { column: 'account_code', ascending: true },
    },
    !!associationId
  );

  return { data: data || [], isLoading, error };
};
