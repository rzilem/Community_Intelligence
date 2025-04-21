
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AssociationAIIssue } from '@/types/association-types';
import { toast } from 'sonner';

export function useAssociationAIIssues(associationId: string | undefined) {
  return useQuery({
    queryKey: ['association-ai-issues', associationId],
    queryFn: async (): Promise<AssociationAIIssue[]> => {
      if (!associationId) return [];
      
      try {
        // In a real implementation, this would fetch from a real table
        // For now, we'll generate some realistic issues based on real data
        
        // First check if we have any overdue invoices
        const { data: overdueInvoices, error: invoiceError } = await supabase
          .from('invoices')
          .select('count')
          .eq('association_id', associationId)
          .eq('status', 'pending')
          .lt('due_date', new Date().toISOString())
          .limit(1);
          
        if (invoiceError) throw invoiceError;
        
        // Check for properties without residents
        const { data: propertiesWithoutResidents, error: propertyError } = await supabase
          .from('properties')
          .select('id')
          .eq('association_id', associationId)
          .not('id', 'in', (supabase
            .from('residents')
            .select('property_id')
            .limit(1000)))
          .limit(5);
          
        if (propertyError) throw propertyError;
        
        // Generate AI issues based on real database conditions
        const issues: AssociationAIIssue[] = [];
        
        if (overdueInvoices && overdueInvoices.length > 0) {
          issues.push({
            id: '1',
            title: 'Invoice Approval Pending',
            description: 'There are unpaid invoices past their due date that need attention.',
            severity: 'high',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'open',
            association_id: associationId
          });
        }
        
        if (propertiesWithoutResidents && propertiesWithoutResidents.length > 0) {
          issues.push({
            id: '2',
            title: 'Properties Without Residents',
            description: `${propertiesWithoutResidents.length} properties have no assigned residents. This may affect communications and billing.`,
            severity: 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'open',
            association_id: associationId
          });
        }
        
        // Always add compliance reminder issue
        issues.push({
          id: '3',
          title: 'Compliance Notices Due',
          description: 'Annual compliance notices need to be sent to all homeowners by the end of the month.',
          severity: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'open',
          association_id: associationId
        });
        
        // Add SSL certificate issue if we have a website
        const { data: associationData } = await supabase
          .from('associations')
          .select('website')
          .eq('id', associationId)
          .single();
          
        if (associationData?.website) {
          issues.push({
            id: '4',
            title: 'Security Certificates Expiring',
            description: 'SSL certificates for the resident portal will expire in 14 days.',
            severity: 'critical',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'in-progress',
            association_id: associationId
          });
        }
        
        return issues;
      } catch (error) {
        console.error('Error generating AI issues:', error);
        toast.error('Failed to analyze association data');
        return [];
      }
    },
    enabled: !!associationId
  });
}
