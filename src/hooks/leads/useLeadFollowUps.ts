
import { useSupabaseQuery, useSupabaseCreate } from '@/hooks/supabase';
import { LeadFollowUp } from '@/types/lead-types';
import { toast } from 'sonner';

export const useLeadFollowUps = (leadId?: string) => {
  const {
    data: followUps = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<LeadFollowUp[]>(
    'lead_follow_ups',
    {
      filter: leadId ? [{ column: 'lead_id', value: leadId }] : [],
      order: { column: 'scheduled_date', ascending: true }
    }
  );

  const createFollowUp = useSupabaseCreate<LeadFollowUp>('lead_follow_ups', {
    onSuccess: () => {
      toast.success('Follow-up scheduled successfully');
      refetch();
    }
  });

  return {
    followUps,
    isLoading,
    error,
    createFollowUp: createFollowUp.mutateAsync,
    isCreating: createFollowUp.isPending,
    refreshFollowUps: refetch
  };
};
