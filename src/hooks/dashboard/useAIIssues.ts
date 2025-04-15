
import { useState, useEffect } from 'react';
import { AIIssue } from '@/components/dashboard/AIAnalysisSection';

const mockIssues: AIIssue[] = [
  {
    id: '1',
    title: 'Invoice Approval Pending',
    description: 'There are 5 invoices awaiting approval for more than 7 days.',
    severity: 'high',
    associationId: 'assoc-1',
  },
  {
    id: '2',
    title: 'Security Certificates Expiring',
    description: 'SSL certificates for the resident portal will expire in 14 days.',
    severity: 'critical',
    associationId: 'assoc-2',
  },
  {
    id: '3',
    title: 'Compliance Notices Due',
    description: 'Annual compliance notices need to be sent to all homeowners by the end of the month.',
    severity: 'medium',
    associationId: 'assoc-3',
  },
  {
    id: '4',
    title: 'Resident Portal Usage Declining',
    description: 'Resident portal logins have decreased by 30% over the past month.',
    severity: 'low',
    associationId: 'assoc-4',
  },
];

export function useAIIssues() {
  const [issues, setIssues] = useState<AIIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch from Supabase
        // const { data, error } = await supabase.from('ai_issues').select('*');
        // if (error) throw error;
        
        // Using mock data for now
        setIssues(mockIssues);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error("Error fetching AI issues:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchIssues();
  }, []);
  
  return { issues, loading, error };
}
