
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CriticalIssue, CriticalIssueItem } from './CriticalIssueItem';

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
