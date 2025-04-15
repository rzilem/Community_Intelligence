
import React, { useState } from 'react';
import { AlertTriangle, Clock, FileText, ListChecks, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIFixDialog } from '@/components/ai/AIFixDialog';
import { useAIFixOptions, AIIssueType } from '@/hooks/ai/useAIFixOptions';

// Type for critical issues (imported from existing CriticalInfoTabs)
export interface CriticalIssue {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'expired' | 'pending' | 'missing' | 'overdue' | 'payment';
  actionOptions: string[];
}

interface CriticalIssueItemProps {
  issue: CriticalIssue;
  onResolve: (issueId: string, action: string) => void;
}

export const CriticalIssueItem: React.FC<CriticalIssueItemProps> = ({ issue, onResolve }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { getFixOptions } = useAIFixOptions();
  
  // Map critical issue types to AI issue types
  const getIssueType = (type: string, title: string): AIIssueType => {
    if (type === 'expired' && title.includes('Certificate')) return 'security-certificates';
    if (type === 'pending' && title.includes('Order')) return 'invoice-approval';
    if (type === 'overdue' && title.includes('Payment')) return 'invoice-approval';
    return 'invoice-approval'; // Default fallback
  };

  const IconComponent = () => {
    switch (issue.type) {
      case 'expired': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'missing': return <FileText className="h-4 w-4 text-red-500" />;
      case 'overdue': return <Clock className="h-4 w-4 text-red-500" />;
      case 'payment': return <PiggyBank className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Convert priority to severity for AIFixDialog
  const priorityToSeverity = (priority: string): 'critical' | 'high' | 'medium' | 'low' => {
    switch (priority) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  // Convert action options to fix options
  const getFixOptionsFromActions = () => {
    return issue.actionOptions.map((action, index) => ({
      id: `action-${index}`,
      label: action,
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        onResolve(issue.id, action);
      }
    }));
  };

  return (
    <div className="flex items-center justify-between border-b py-2">
      <div className="flex items-start gap-2">
        <div className="pt-0.5">
          <IconComponent />
        </div>
        <div>
          <h4 className="text-sm font-medium">{issue.title}</h4>
          <p className="text-xs text-muted-foreground">{issue.description}</p>
        </div>
      </div>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="ml-2 h-8"
        onClick={() => setDialogOpen(true)}
      >
        Fix Issue
      </Button>

      <AIFixDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={issue.title}
        description={issue.description}
        severity={priorityToSeverity(issue.priority)}
        options={getFixOptionsFromActions()}
      />
    </div>
  );
};
