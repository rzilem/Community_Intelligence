
import { useSupabaseUpdate } from '@/hooks/supabase';
import { Lead } from '@/types/lead-types';
import { toast } from 'sonner';

export const useLeadScoring = () => {
  const updateScore = useSupabaseUpdate<Lead>('leads', {
    onSuccess: () => {
      toast.success('Lead score updated');
    }
  });

  const calculateScore = (lead: Lead): number => {
    let score = 0;
    
    // Basic scoring rules
    if (lead.number_of_units) {
      score += Math.min(Math.floor(lead.number_of_units / 10), 50); // Up to 50 points for unit count
    }
    
    if (lead.association_name) score += 10;
    if (lead.phone) score += 10;
    if (lead.email) score += 10;
    if (lead.status === 'qualified') score += 20;
    if (lead.proposal_count > 0) score += 30;
    
    return Math.min(score, 100); // Cap at 100
  };

  const updateLeadScore = async (lead: Lead) => {
    const newScore = calculateScore(lead);
    
    if (newScore !== lead.lead_score) {
      await updateScore.mutateAsync({
        id: lead.id,
        data: { lead_score: newScore }
      });
    }
  };

  return {
    calculateScore,
    updateLeadScore,
    isUpdating: updateScore.isPending
  };
};
