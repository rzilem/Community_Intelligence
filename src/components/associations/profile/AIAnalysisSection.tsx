
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssociationAIIssue } from '@/types/association-types';
import { AIIssueCard } from './AIIssueCard';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '@/components/ui/loading-state';

interface AIAnalysisSectionProps {
  aiIssues: AssociationAIIssue[];
  isLoading?: boolean;
  error?: Error | null;
}

export const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ 
  aiIssues,
  isLoading = false,
  error = null
}) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/system/ai-issues');
  };

  if (isLoading) {
    return (
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-600">AI Analysis</h3>
            </div>
          </div>
          <LoadingState text="Analyzing association data..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-600">AI Analysis</h3>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Analysis Error</h4>
                <p className="text-sm text-muted-foreground">
                  {error.message || 'Failed to analyze association data'}
                </p>
                <Button 
                  variant="link" 
                  className="px-0 h-auto text-sm"
                  onClick={() => window.location.reload()}
                >
                  Retry Analysis
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-600">AI Analysis</h3>
          </div>
          <Button variant="link" className="text-blue-600" onClick={handleViewAll}>
            View All
          </Button>
        </div>

        {aiIssues.length === 0 ? (
          <div className="bg-white p-6 rounded-md border text-center">
            <p className="text-muted-foreground">No issues detected for this association.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aiIssues.map((issue) => (
              <AIIssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
