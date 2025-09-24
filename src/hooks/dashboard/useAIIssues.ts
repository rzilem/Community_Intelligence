
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIIssue {
  id: string;
  title: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
}

export const useAIIssues = (associationId?: string) => {
  const [issues, setIssues] = useState<AIIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAIIssues();
  }, [associationId]);

  const fetchAIIssues = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate mock AI issues since many tables don't exist yet
      const issues: AIIssue[] = [];

      // Generate sample issues for demonstration
      issues.push({
        id: 'ai-sample-financial',
        title: 'Sample Financial Alert',
        type: 'financial',
        description: 'Demo: Potential overdue payments detected in system analysis',
        severity: 'medium',
        status: 'open'
      });

      issues.push({
        id: 'ai-sample-maintenance',
        title: 'Sample Maintenance Alert',
        type: 'maintenance',
        description: 'Demo: System detected potential maintenance backlog',
        severity: 'low',
        status: 'open'
      });

      issues.push({
        id: 'ai-sample-communication',
        title: 'Sample Communication Gap',
        type: 'communication',
        description: 'Demo: Consider increasing resident communication frequency',
        severity: 'low',
        status: 'open'
      });

      setIssues(issues);

    } catch (err) {
      console.error('Error fetching AI issues:', err);
      setError('Failed to analyze system for issues');
    } finally {
      setLoading(false);
    }
  };

  return {
    issues,
    loading,
    error,
    refetch: fetchAIIssues
  };
};
