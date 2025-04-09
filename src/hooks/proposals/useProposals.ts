
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { Proposal } from '@/types/proposal-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export const useProposals = (leadId?: string) => {
  const filters = leadId ? [{ column: 'lead_id', value: leadId }] : [];
  
  const { 
    data: proposals = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<Proposal[]>('proposals', {
    filter: filters,
    order: { column: 'created_at', ascending: false }
  });

  const createProposal = useSupabaseCreate<Proposal>('proposals', {
    onSuccess: () => {
      toast.success('Proposal created successfully');
      refetch();
    }
  });

  const updateProposal = useSupabaseUpdate<Proposal>('proposals', {
    onSuccess: () => {
      toast.success('Proposal updated successfully');
      refetch();
    }
  });

  const deleteProposal = useSupabaseDelete('proposals', {
    onSuccess: () => {
      toast.success('Proposal deleted successfully');
      refetch();
    }
  });

  const getProposal = useCallback(async (id: string): Promise<Proposal | null> => {
    const { data, error } = await supabase
      .from('proposals' as any)
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      toast.error(`Error loading proposal: ${error.message}`);
      return null;
    }
    
    return data as unknown as Proposal;
  }, []);

  return {
    proposals,
    isLoading,
    error,
    createProposal: createProposal.mutateAsync,
    updateProposal: updateProposal.mutateAsync,
    deleteProposal: deleteProposal.mutateAsync,
    getProposal,
    refreshProposals: refetch
  };
};
