
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssociationAIIssue } from '@/types/association-types';
import { AIIssueCard } from './AIIssueCard';

interface AIAnalysisSectionProps {
  aiIssues: AssociationAIIssue[];
}

export const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ aiIssues }) => {
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
            <AIIssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
