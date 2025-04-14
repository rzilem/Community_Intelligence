
import { useState } from 'react';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { OnboardingTemplate, OnboardingStage, OnboardingTask } from '@/types/onboarding-types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useOnboardingTemplateCreator = () => {
  const navigate = useNavigate();
  const { createTemplate, createStage, createTask } = useOnboardingTemplates();
  const [isCreating, setIsCreating] = useState(false);

  const createHOAOnboardingTemplate = async (templateName: string, templateDescription: string) => {
    try {
      setIsCreating(true);
      
      // 1. Create the template
      const newTemplate = await createTemplate({
        name: templateName,
        description: templateDescription,
        template_type: 'hoa',
        estimated_days: 60 // Total days for complete onboarding
      });
      
      const templateId = newTemplate.id;
      
      // 2. Create the stages
      const stagesData = [
        { name: 'Day 1', description: 'First day tasks', order_index: 0, estimated_days: 1 },
        { name: 'Day 5', description: 'Week 1 follow-up tasks', order_index: 1, estimated_days: 4 },
        { name: 'Day 10', description: 'Week 2 tasks', order_index: 2, estimated_days: 5 },
        { name: 'Day 15', description: 'Week 3 tasks', order_index: 3, estimated_days: 5 },
        { name: 'Day 30', description: 'Month 1 completion tasks', order_index: 4, estimated_days: 15 },
        { name: 'Day 60', description: 'Final onboarding tasks', order_index: 5, estimated_days: 30 }
      ];
      
      // Create each stage and store stage ID references
      const stageIds: Record<string, string> = {};
      
      for (const stageData of stagesData) {
        const stage = await createStage({
          template_id: templateId,
          name: stageData.name,
          description: stageData.description,
          order_index: stageData.order_index,
          estimated_days: stageData.estimated_days
        });
        
        stageIds[stageData.name] = stage.id;
      }
      
      // 3. Create tasks for each stage
      // Day 1 Tasks
      const day1Tasks = [
        { name: 'Gather Information from Prior Management', estimated_days: 1, task_type: 'team' },
        { name: 'Create New Association', estimated_days: 1, task_type: 'team' },
        { name: 'Let Bank know - open new accounts, if applicable', estimated_days: 1, task_type: 'team' },
        { name: 'Order Debit Card', estimated_days: 1, task_type: 'team' },
        { name: 'Enter Bank Accounts', estimated_days: 1, task_type: 'team' },
        { name: 'Setup Funds', estimated_days: 1, task_type: 'team' },
        { name: 'Mark Association LIVE in system', estimated_days: 1, task_type: 'team' },
        { name: 'Import Owner\'s List', estimated_days: 1, task_type: 'team' },
        { name: 'Merge Owners, if applicable', estimated_days: 1, task_type: 'team' },
        { name: 'Enter Association Addresses (NOT OWNER ADDRESSES)', estimated_days: 1, task_type: 'team' },
        { name: 'Enter start date in Association Additional Info', estimated_days: 1, task_type: 'team' },
        { name: 'Enter Assessment Frequency in Association Additional Info', estimated_days: 1, task_type: 'team' },
        { name: 'Setup Assessments (including fees and action item charges)', estimated_days: 1, task_type: 'team' },
        { name: 'Exclude GL1 from Collections when setting up assessments', estimated_days: 1, task_type: 'team' },
        { name: 'Late fee Setup and Grace period', estimated_days: 1, task_type: 'team' },
        { name: 'Edit Collection Settings', estimated_days: 1, task_type: 'team' },
        { name: 'Logo, Banner, & Dashboard Pages', estimated_days: 1, task_type: 'team' },
        { name: 'Adjust Association Settings', estimated_days: 1, task_type: 'team' },
        { name: 'Add Folder to Community Documents in SharePoint', estimated_days: 1, task_type: 'team' },
        { name: 'Management Certificate Order Form', estimated_days: 1, task_type: 'team' },
        { name: 'Bank Account Beginning Balance, Outstanding Items', estimated_days: 1, task_type: 'team' },
        { name: 'GL Trial Balance', estimated_days: 1, task_type: 'team' }
      ];
      
      // Day 5 Tasks
      const day5Tasks = [
        { name: 'Send Welcome/Intro Letter', estimated_days: 1, task_type: 'team' },
        { name: 'Create Portal Logins', estimated_days: 1, task_type: 'team' },
        { name: 'Enter Board Members & Committees (after logins are created)', estimated_days: 1, task_type: 'team' },
        { name: 'Setup Homeowner Tags (Board Member Tags and Charge Tags)', estimated_days: 1, task_type: 'team' },
        { name: 'Update Customer Service Team', estimated_days: 1, task_type: 'team' },
        { name: 'Setup in Smartweb, if applicable (based on Contract - Contact Ricky)', estimated_days: 1, task_type: 'team' },
        { name: 'Create connection in mailing system', estimated_days: 1, task_type: 'team' },
        { name: 'Homeowner Additional Info', estimated_days: 1, task_type: 'team' }
      ];
      
      // Day 10 Tasks
      const day10Tasks = [
        { name: 'Email CC/Insurance Policy/Articles of Inc to setup for potential Insurance Program', estimated_days: 1, task_type: 'team' },
        { name: 'Upload Association Documents', estimated_days: 1, task_type: 'team' },
        { name: 'Notify Phyllis Team About New Community', estimated_days: 1, task_type: 'team' },
        { name: 'Registered Agent', estimated_days: 1, task_type: 'team' },
        { name: 'Enter Association Services/Contracts', estimated_days: 1, task_type: 'team' },
        { name: 'Enter Vendor ACH Data', estimated_days: 1, task_type: 'team' },
        { name: 'New Vendors', estimated_days: 1, task_type: 'team' },
        { name: 'Update Vendor Billing Info in system', estimated_days: 1, task_type: 'team' },
        { name: 'Add Cost Code to Stamps.com', estimated_days: 1, task_type: 'team' },
        { name: 'Rename Bank Accounts with Bank', estimated_days: 1, task_type: 'team' },
        { name: '1099 Data Import', estimated_days: 1, task_type: 'team' }
      ];
      
      // Day 15 Tasks
      const day15Tasks = [
        { name: 'Add dates to Association\'s Calendar', estimated_days: 1, task_type: 'team' },
        { name: 'Auto-Invoice MGMT Fees', estimated_days: 1, task_type: 'team' },
        { name: 'Change property tax mailing address/contact info', estimated_days: 1, task_type: 'team' },
        { name: 'Violation Types & Descriptions', estimated_days: 1, task_type: 'team' },
        { name: 'ARC Types & Descriptions', estimated_days: 1, task_type: 'team' },
        { name: 'Verify Pool Permit', estimated_days: 1, task_type: 'team' },
        { name: 'Setup Recurring Journal Entries', estimated_days: 1, task_type: 'team' },
        { name: 'Setup Recurring Transfers', estimated_days: 1, task_type: 'team' },
        { name: 'Admin Billing Setup', estimated_days: 1, task_type: 'team' },
        { name: 'Enter Budget', estimated_days: 1, task_type: 'team' }
      ];
      
      // Day 30 Tasks
      const day30Tasks = [
        { name: 'Association Property Request', estimated_days: 1, task_type: 'team' },
        { name: 'Request Homeowner Ledgers and AR Report', estimated_days: 1, task_type: 'team' },
        { name: 'Request Access to Gate System (if applicable)', estimated_days: 1, task_type: 'team' },
        { name: 'Homeowner Transaction History Import', estimated_days: 1, task_type: 'team' },
        { name: 'Request Final Financials', estimated_days: 1, task_type: 'team' },
        { name: 'Request remaining accounts be closed and funds sent over', estimated_days: 1, task_type: 'team' },
        { name: 'Request zero balance statements after start date', estimated_days: 1, task_type: 'team' },
        { name: 'Upload Historical Association Documents', estimated_days: 1, task_type: 'team' },
        { name: 'Enter Bankruptcy action items', estimated_days: 1, task_type: 'team' },
        { name: 'Setup Community Attorney', estimated_days: 1, task_type: 'team' },
        { name: 'Set Owner\'s Collection Status', estimated_days: 1, task_type: 'team' }
      ];
      
      // Day 60 Tasks
      const day60Tasks = [
        { name: 'Turn on Collection Letters', estimated_days: 1, task_type: 'team' }
      ];
      
      // Create all tasks for each stage
      const stageTaskMap = {
        'Day 1': day1Tasks,
        'Day 5': day5Tasks,
        'Day 10': day10Tasks,
        'Day 15': day15Tasks,
        'Day 30': day30Tasks,
        'Day 60': day60Tasks
      };
      
      for (const [stageName, tasks] of Object.entries(stageTaskMap)) {
        const stageId = stageIds[stageName];
        
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          await createTask({
            stage_id: stageId,
            name: task.name,
            description: '',
            order_index: i,
            estimated_days: task.estimated_days,
            task_type: task.task_type as 'client' | 'team',
            assigned_role: 'Manager'
          });
        }
      }
      
      toast.success(`${templateName} template created successfully with all stages and tasks!`);
      
      // Navigate to the newly created template
      navigate(`/lead-management/onboarding/templates/${templateId}`);
      
      return templateId;
    } catch (error) {
      console.error('Error creating HOA onboarding template:', error);
      toast.error('Failed to create template');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createHOAOnboardingTemplate,
    isCreating
  };
};
