
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AssociationAIIssue } from '@/types/association-types';

interface AIIssueCardProps {
  issue: AssociationAIIssue;
}

export const AIIssueCard: React.FC<AIIssueCardProps> = ({ issue }) => {
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

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
        <Button variant="default" size="sm">
          Fix This
        </Button>
      </div>
    </div>
  );
};
