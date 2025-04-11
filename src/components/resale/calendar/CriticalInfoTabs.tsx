
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertTriangle, Clock, FileText, ListChecks, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Type for critical issues
interface CriticalIssue {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'expired' | 'pending' | 'missing' | 'overdue' | 'payment';
  actionOptions: string[];
}

// Mock data for issues
const MOCK_ISSUES: Record<string, CriticalIssue[]> = {
  documents: [
    {
      id: 'doc-1',
      title: 'Certificate #1402 Expiring Soon',
      description: 'Resale certificate for 123 Main St will expire in 5 days',
      priority: 'high',
      type: 'expired',
      actionOptions: ['Renew Certificate', 'Notify Owner', 'Request Extension']
    },
    {
      id: 'doc-2',
      title: 'Missing Statement for Oak Hills HOA',
      description: 'Account statement required for resale package ID #4502',
      priority: 'medium',
      type: 'missing',
      actionOptions: ['Generate Statement', 'Contact Accounting', 'Mark as N/A']
    }
  ],
  orders: [
    {
      id: 'order-1',
      title: 'Rush Order #3821 Needs Approval',
      description: 'Pending approval for 72-hour rush order for 456 Elm St',
      priority: 'high',
      type: 'pending',
      actionOptions: ['Approve Order', 'Request More Info', 'Assign to Manager']
    },
    {
      id: 'order-2',
      title: 'Inspection Required for Order #2910',
      description: 'Property inspection needed to complete closing documents',
      priority: 'medium',
      type: 'pending',
      actionOptions: ['Schedule Inspection', 'Outsource to Vendor', 'Contact Owner']
    }
  ],
  payments: [
    {
      id: 'payment-1',
      title: 'Overdue Payment for Order #4721',
      description: 'Payment of $350 for resale package is 7 days overdue',
      priority: 'high',
      type: 'overdue',
      actionOptions: ['Send Reminder', 'Process Payment', 'Apply Late Fee']
    }
  ]
};

interface CriticalIssueItemProps {
  issue: CriticalIssue;
  onResolve: (issueId: string, action: string) => void;
}

const CriticalIssueItem: React.FC<CriticalIssueItemProps> = ({ issue, onResolve }) => {
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
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="ml-2 h-8">
            Fix Issue
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{issue.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {issue.description}
              <div className="mt-4 font-medium">How would you like to address this issue?</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            {issue.actionOptions.map((action) => (
              <Button 
                key={action} 
                variant="outline" 
                className="w-full justify-start text-left"
                onClick={() => onResolve(issue.id, action)}
              >
                {action}
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const CriticalInfoTabs: React.FC = () => {
  const [issues, setIssues] = useState(MOCK_ISSUES);

  const handleResolveIssue = (issueId: string, action: string) => {
    // In a real app, you would handle the action on the backend
    toast.success(`Applied action: ${action}`);
    
    // Remove the issue from the list
    setIssues(prev => {
      const newIssues = { ...prev };
      Object.keys(newIssues).forEach(category => {
        newIssues[category] = newIssues[category].filter(issue => issue.id !== issueId);
      });
      return newIssues;
    });
  };

  // Calculate total counts
  const documentCount = issues.documents.length;
  const orderCount = issues.orders.length;
  const paymentCount = issues.payments.length;
  const totalCount = documentCount + orderCount + paymentCount;

  if (totalCount === 0) {
    return null; // Don't render if no issues
  }

  return (
    <Tabs defaultValue="all" className="mb-4">
      <TabsList className="grid w-full grid-cols-4 h-9">
        <TabsTrigger value="all" className="text-xs">
          All Issues ({totalCount})
        </TabsTrigger>
        <TabsTrigger value="documents" className="text-xs">
          Documents ({documentCount})
        </TabsTrigger>
        <TabsTrigger value="orders" className="text-xs">
          Orders ({orderCount})
        </TabsTrigger>
        <TabsTrigger value="payments" className="text-xs">
          Payments ({paymentCount})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="border rounded-md mt-2 px-4 py-2 max-h-64 overflow-y-auto">
        {totalCount > 0 ? (
          <>
            {issues.documents.map(issue => (
              <CriticalIssueItem 
                key={issue.id} 
                issue={issue} 
                onResolve={handleResolveIssue} 
              />
            ))}
            {issues.orders.map(issue => (
              <CriticalIssueItem 
                key={issue.id} 
                issue={issue} 
                onResolve={handleResolveIssue} 
              />
            ))}
            {issues.payments.map(issue => (
              <CriticalIssueItem 
                key={issue.id} 
                issue={issue} 
                onResolve={handleResolveIssue} 
              />
            ))}
          </>
        ) : (
          <p className="text-sm text-center py-4">No critical issues found</p>
        )}
      </TabsContent>
      
      <TabsContent value="documents" className="border rounded-md mt-2 px-4 py-2 max-h-64 overflow-y-auto">
        {documentCount > 0 ? (
          issues.documents.map(issue => (
            <CriticalIssueItem 
              key={issue.id} 
              issue={issue} 
              onResolve={handleResolveIssue} 
            />
          ))
        ) : (
          <p className="text-sm text-center py-4">No document issues found</p>
        )}
      </TabsContent>
      
      <TabsContent value="orders" className="border rounded-md mt-2 px-4 py-2 max-h-64 overflow-y-auto">
        {orderCount > 0 ? (
          issues.orders.map(issue => (
            <CriticalIssueItem 
              key={issue.id} 
              issue={issue} 
              onResolve={handleResolveIssue} 
            />
          ))
        ) : (
          <p className="text-sm text-center py-4">No order issues found</p>
        )}
      </TabsContent>
      
      <TabsContent value="payments" className="border rounded-md mt-2 px-4 py-2 max-h-64 overflow-y-auto">
        {paymentCount > 0 ? (
          issues.payments.map(issue => (
            <CriticalIssueItem 
              key={issue.id} 
              issue={issue} 
              onResolve={handleResolveIssue} 
            />
          ))
        ) : (
          <p className="text-sm text-center py-4">No payment issues found</p>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CriticalInfoTabs;
