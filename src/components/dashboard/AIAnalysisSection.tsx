
import React from 'react';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const handleFixIssue = (issueId: string) => {
    toast.success(`Issue ${issueId} has been marked for resolution.`);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500 text-white">critical</Badge>;
      case 'high':
        return <Badge className="bg-amber-500 text-white">high</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500 text-white">medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500 text-white">low</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-600">AI Analysis</h2>
        </div>
        <Button variant="link" className="text-blue-600 hover:text-blue-800">
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
            <div key={issue.id} className="rounded-lg border p-4 shadow-sm bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{issue.title}</h3>
                    {getSeverityBadge(issue.severity)}
                  </div>
                  <p className="text-muted-foreground">{issue.description}</p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleFixIssue(issue.id)}
                >
                  Fix This
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
