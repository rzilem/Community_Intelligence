
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FixOption } from '@/components/ai/AIFixDialog';

export type AIIssueType = 
  | 'invoice-approval' 
  | 'security-certificates' 
  | 'compliance-notices' 
  | 'portal-usage';

export function useAIFixOptions() {
  const navigate = useNavigate();

  const getFixOptions = (issueType: AIIssueType): FixOption[] => {
    switch (issueType) {
      case 'invoice-approval':
        return [
          {
            id: 'review-invoices',
            label: 'Review Pending Invoices',
            description: 'View and approve the awaiting invoices',
            route: '/accounting/invoice-queue',
          },
          {
            id: 'auto-approve',
            label: 'Approve All Pending Invoices',
            description: 'Automatically approve all invoices awaiting approval',
            action: async () => {
              // Simulate API call to approve invoices
              await new Promise(resolve => setTimeout(resolve, 1500));
              toast.success('All pending invoices have been approved');
            }
          },
          {
            id: 'setup-auto-approval',
            label: 'Setup Auto-Approval Rules',
            description: 'Configure rules for automatic invoice approval',
            route: '/accounting/settings',
          }
        ];
        
      case 'security-certificates':
        return [
          {
            id: 'renew-certificates',
            label: 'Renew SSL Certificates Now',
            description: 'Process certificate renewal immediately',
            action: async () => {
              // Simulate API call to renew certificates
              await new Promise(resolve => setTimeout(resolve, 1500));
              toast.success('SSL certificates have been renewed successfully');
            }
          },
          {
            id: 'schedule-renewal',
            label: 'Schedule Automatic Renewal',
            description: 'Set up automatic renewal for all certificates',
            action: async () => {
              await new Promise(resolve => setTimeout(resolve, 1500));
              toast.success('Automatic renewal has been scheduled');
            }
          },
          {
            id: 'security-settings',
            label: 'View Security Settings',
            description: 'Review and modify security configuration',
            route: '/system/security',
          }
        ];
        
      case 'compliance-notices':
        return [
          {
            id: 'send-notices',
            label: 'Send Compliance Notices Now',
            description: 'Send notices to all homeowners immediately',
            action: async () => {
              await new Promise(resolve => setTimeout(resolve, 1500));
              toast.success('Compliance notices have been sent to all homeowners');
            }
          },
          {
            id: 'schedule-notices',
            label: 'Schedule Notices for Later',
            description: 'Set a specific date to send the notices',
            route: '/communications/scheduled',
          },
          {
            id: 'customize-notices',
            label: 'Customize Notice Templates',
            description: 'Edit the content of compliance notices',
            route: '/communications/templates',
          }
        ];
        
      case 'portal-usage':
        return [
          {
            id: 'send-reminder',
            label: 'Send Portal Usage Reminder',
            description: 'Notify residents about portal features and benefits',
            action: async () => {
              await new Promise(resolve => setTimeout(resolve, 1500));
              toast.success('Portal usage reminders have been sent to all residents');
            }
          },
          {
            id: 'portal-training',
            label: 'Schedule Portal Training Session',
            description: 'Set up a virtual training session for residents',
            route: '/calendar/new-event',
          },
          {
            id: 'portal-analytics',
            label: 'View Portal Analytics',
            description: 'See detailed usage statistics and trends',
            route: '/system/analytics/portal',
          }
        ];
        
      default:
        return [
          {
            id: 'generic-fix',
            label: 'Address This Issue',
            description: 'Fix this issue using automated AI recommendations',
            action: async () => {
              await new Promise(resolve => setTimeout(resolve, 1000));
              toast.success('The issue has been addressed successfully');
            }
          }
        ];
    }
  };

  return { getFixOptions };
}
