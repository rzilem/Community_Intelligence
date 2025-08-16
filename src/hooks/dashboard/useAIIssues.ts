
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

      // Fetch from multiple sources to create AI-detected issues
      const issues: AIIssue[] = [];

      // 1. Check for overdue assessments
      let assessmentsQuery = supabase
        .from('assessments')
        .select(`
          id,
          due_date,
          amount,
          paid,
          properties!inner(
            unit_number,
            association_id
          )
        `)
        .eq('paid', false)
        .lt('due_date', new Date().toISOString().split('T')[0]);

      if (associationId) {
        assessmentsQuery = assessmentsQuery.eq('properties.association_id', associationId);
      }

      const { data: overdueAssessments } = await assessmentsQuery;

      if (overdueAssessments && overdueAssessments.length > 0) {
        const totalOverdue = overdueAssessments.reduce((sum, a) => sum + Number(a.amount), 0);
        issues.push({
          id: 'ai-overdue-assessments',
          title: 'Overdue Assessment Payments Detected',
          type: 'financial',
          description: `${overdueAssessments.length} properties have overdue assessments totaling $${totalOverdue.toLocaleString()}`,
          severity: overdueAssessments.length > 5 ? 'high' : 'medium',
          status: 'open'
        });
      }

      // 2. Check for long-pending maintenance requests
      let requestsQuery = supabase
        .from('homeowner_requests')
        .select('id, title, created_at, association_id')
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (associationId) {
        requestsQuery = requestsQuery.eq('association_id', associationId);
      }

      const { data: oldRequests } = await requestsQuery;

      if (oldRequests && oldRequests.length > 0) {
        issues.push({
          id: 'ai-old-requests',
          title: 'Stale Maintenance Requests',
          type: 'maintenance',
          description: `${oldRequests.length} maintenance requests have been pending for over a week`,
          severity: oldRequests.length > 3 ? 'high' : 'medium',
          status: 'open'
        });
      }

      // 3. Check for unresolved compliance violations
      let violationsQuery = supabase
        .from('compliance_violations')
        .select('id, violation_type, created_at, association_id')
        .eq('status', 'open')
        .lt('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

      if (associationId) {
        violationsQuery = violationsQuery.eq('association_id', associationId);
      }

      const { data: oldViolations } = await violationsQuery;

      if (oldViolations && oldViolations.length > 0) {
        issues.push({
          id: 'ai-old-violations',
          title: 'Long-Standing Compliance Issues',
          type: 'compliance',
          description: `${oldViolations.length} compliance violations have been open for over 2 weeks`,
          severity: 'high',
          status: 'open'
        });
      }

      // 4. Check for communication gaps (no announcements in 30 days)
      let announcementsQuery = supabase
        .from('announcements')
        .select('id, created_at, association_id')
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (associationId) {
        announcementsQuery = announcementsQuery.eq('association_id', associationId);
      }

      const { data: recentAnnouncements } = await announcementsQuery;

      if (!recentAnnouncements || recentAnnouncements.length === 0) {
        issues.push({
          id: 'ai-communication-gap',
          title: 'Communication Gap Detected',
          type: 'communication',
          description: 'No announcements or communications sent in the past 30 days',
          severity: 'low',
          status: 'open'
        });
      }

      // 5. Check for low AI processing confidence scores
      const { data: lowConfidenceProcessing } = await supabase
        .from('ai_processing_results')
        .select('id, confidence_scores')
        .not('confidence_scores', 'is', null);

      const lowConfidenceCount = lowConfidenceProcessing?.filter(result => {
        const scores = result.confidence_scores as any;
        return scores && Object.values(scores).some((score: any) => score < 0.7);
      }).length || 0;

      if (lowConfidenceCount > 0) {
        issues.push({
          id: 'ai-low-confidence',
          title: 'AI Processing Quality Issues',
          type: 'system',
          description: `${lowConfidenceCount} recent AI processing results have low confidence scores`,
          severity: lowConfidenceCount > 5 ? 'medium' : 'low',
          status: 'open'
        });
      }

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
