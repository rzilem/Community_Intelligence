
import React from 'react';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIIssueCard } from './AIIssueCard';

export interface AIIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  associationId?: string;
}

interface AIAnalysisSectionProps {
  issues: AIIssue[];
}

export const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ issues }) => {
  const handleViewAll = () => {
    toast.info('Navigating to all AI analysis issues');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-600">AI Analysis</h2>
        </div>
        <Button variant="link" className="text-blue-600 hover:text-blue-800" onClick={handleViewAll}>
          View All
        </Button>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">No issues detected at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <AIIssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};
