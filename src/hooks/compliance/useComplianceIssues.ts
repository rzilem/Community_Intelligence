
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Compliance } from '@/types/compliance-types';
import { toast } from 'sonner';

export function useComplianceIssues(associationId?: string) {
  const {
    data: issues = [],
    isLoading,
    error,
    refetch: refetchIssues
  } = useQuery({
    queryKey: ['compliance_issues', associationId],
    queryFn: async () => {
      try {
        if (!associationId) return [];
        
        const { data, error } = await supabase
          .from('compliance_issues')
          .select('*')
          .eq('association_id', associationId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return data as Compliance[];
      } catch (error: any) {
        toast.error(`Error fetching compliance issues: ${error.message}`);
        throw error;
      }
    },
    enabled: !!associationId
  });

  return {
    issues,
    isLoading,
    error,
    refetchIssues
  };
}
