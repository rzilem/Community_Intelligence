
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AssociationAIIssue } from '@/types/association-types';

interface AIAnalysisSectionProps {
  aiIssues: AssociationAIIssue[];
}

export const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ aiIssues }) => {
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
    <Card className="bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-600">AI Analysis</h3>
          </div>
          <Button variant="link" className="text-blue-600">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {aiIssues.map((issue) => (
            <div key={issue.id} className="bg-white border rounded-lg p-4">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
