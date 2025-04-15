
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIIssue } from '@/components/dashboard/AIAnalysisSection';
import { AIFixDialog } from '@/components/ai/AIFixDialog';
import { useAIFixOptions, AIIssueType } from '@/hooks/ai/useAIFixOptions';

interface AIIssueCardProps {
  issue: AIIssue;
}

export const AIIssueCard: React.FC<AIIssueCardProps> = ({ issue }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { getFixOptions } = useAIFixOptions();
  
  // Map issue titles to issue types for the fix options
  const getIssueType = (title: string): AIIssueType => {
    if (title.includes('Invoice')) return 'invoice-approval';
    if (title.includes('Certificate')) return 'security-certificates';
    if (title.includes('Compliance')) return 'compliance-notices';
    if (title.includes('Portal')) return 'portal-usage';
    return 'invoice-approval'; // Default fallback
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const issueType = getIssueType(issue.title);
  const fixOptions = getFixOptions(issueType);

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{issue.title}</h4>
            <Badge className={getSeverityBadgeColor(issue.severity)}>
              {issue.severity}
            </Badge>
          </div>
          <p className="text-muted-foreground">{issue.description}</p>
        </div>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          Fix This
        </Button>
      </div>

      <AIFixDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={issue.title}
        description={issue.description}
        severity={issue.severity as 'critical' | 'high' | 'medium' | 'low'}
        options={fixOptions}
      />
    </div>
  );
};
