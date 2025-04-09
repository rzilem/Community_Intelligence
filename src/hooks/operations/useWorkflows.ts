
import { useState } from 'react';
import { Workflow } from '@/types/workflow-types';
import { toast } from 'sonner';

export const useWorkflows = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data for workflow templates
  const workflowTemplates: Workflow[] = [
    {
      id: '1',
      name: 'Delinquency Collection Process',
      description: 'Automate the collection of delinquent payments with notifications, late fees, and escalation steps',
      type: 'Financial',
      status: 'template',
      isTemplate: true,
      isPopular: true,
      steps: Array.from({ length: 8 }).map((_, i) => ({
        id: `step-${i}`,
        name: `Step ${i+1}`,
        description: `Description for step ${i+1}`,
        order: i
      }))
    },
    {
      id: '2',
      name: 'Compliance Violation Workflow',
      description: 'Standardized process for handling CC&R violations with notices, hearings, and enforcement actions',
      type: 'Compliance',
      status: 'template',
      isTemplate: true,
      steps: Array.from({ length: 6 }).map((_, i) => ({
        id: `step-${i}`,
        name: `Step ${i+1}`,
        description: `Description for step ${i+1}`,
        order: i
      }))
    },
    {
      id: '3',
      name: 'Maintenance Request Handling',
      description: 'Track maintenance requests from submission to completion with vendor assignments and status updates',
      type: 'Maintenance',
      status: 'template',
      isTemplate: true,
      steps: Array.from({ length: 5 }).map((_, i) => ({
        id: `step-${i}`,
        name: `Step ${i+1}`,
        description: `Description for step ${i+1}`,
        order: i
      }))
    },
    {
      id: '4',
      name: 'New Resident Onboarding',
      description: 'Welcome new residents with community information, access credentials, and orientation materials',
      type: 'Resident Management',
      status: 'template',
      isTemplate: true,
      steps: Array.from({ length: 4 }).map((_, i) => ({
        id: `step-${i}`,
        name: `Step ${i+1}`,
        description: `Description for step ${i+1}`,
        order: i
      }))
    },
    {
      id: '5',
      name: 'Board Meeting Coordination',
      description: 'Schedule meetings, distribute agendas, send reminders, and follow up with minutes',
      type: 'Governance',
      status: 'template',
      isTemplate: true,
      steps: Array.from({ length: 7 }).map((_, i) => ({
        id: `step-${i}`,
        name: `Step ${i+1}`,
        description: `Description for step ${i+1}`,
        order: i
      }))
    },
    {
      id: '6',
      name: 'Architectural Review Process',
      description: 'Manage the submission and approval process for architectural modifications',
      type: 'Compliance',
      status: 'template',
      isTemplate: true,
      steps: Array.from({ length: 5 }).map((_, i) => ({
        id: `step-${i}`,
        name: `Step ${i+1}`,
        description: `Description for step ${i+1}`,
        order: i
      }))
    },
  ];

  const useWorkflowTemplate = (workflowId: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const workflow = workflowTemplates.find(w => w.id === workflowId);
      if (workflow) {
        toast.success(`Template "${workflow.name}" has been selected for use`);
      } else {
        toast.error('Workflow template not found');
      }
      setLoading(false);
    }, 500);
  };

  const createCustomTemplate = () => {
    toast.info('Creating custom template. This feature is coming soon!');
  };

  return {
    workflowTemplates,
    loading,
    error,
    useWorkflowTemplate,
    createCustomTemplate
  };
};
