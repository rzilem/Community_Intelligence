
import { useState } from 'react';
import { LetterTemplate } from '@/types/letter-template-types';

// Sample data for demo purposes
const sampleTemplates: LetterTemplate[] = [
  {
    id: '1',
    name: 'Welcome Letter',
    description: 'A warm welcome to new residents',
    category: 'Welcome',
    content: '<p>Dear {first_name},</p><p>Welcome to our community! We are delighted to have you as a new resident...</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Late Payment Notice',
    description: 'First notice for late assessment payment',
    category: 'Delinquency',
    content: '<p>Dear {first_name},</p><p>This is a friendly reminder that your assessment payment of ${amount} due on {due_date} is now overdue...</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Violation Notice',
    description: 'Notice of CC&R violation',
    category: 'Compliance',
    content: '<p>Dear {first_name},</p><p>We regret to inform you that a violation of our community rules has been observed at your property...</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Architectural Review Approval',
    description: 'Notification of approval for submitted architectural request',
    category: 'Architectural',
    content: '<p>Dear {first_name},</p><p>We are pleased to inform you that your architectural request for {request_type} has been approved...</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Annual Meeting Notice',
    description: 'Notification of upcoming annual meeting',
    category: 'Meeting',
    content: '<p>Dear {first_name},</p><p>This letter serves as notice that our Annual Meeting will be held on {meeting_date} at {meeting_time}...</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Notice of Violation',
    description: 'Formal notice for community rule violations',
    category: 'Compliance',
    content: '<p>Dear {first_name},</p><p>This letter is to formally notify you of a violation of our community rules at your property located at {property_address}...</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Friendly Reminder Notice',
    description: 'Friendly first notice for minor compliance issues',
    category: 'Compliance',
    content: '<p>Dear {first_name},</p><p>This is a friendly reminder regarding a minor issue that has been noticed at your property...</p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useLetterTemplates = () => {
  const [templates, setTemplates] = useState<LetterTemplate[]>(sampleTemplates);
  
  const createTemplate = (template: Partial<LetterTemplate>) => {
    const newTemplate: LetterTemplate = {
      id: Date.now().toString(),
      name: template.name || 'Untitled Template',
      description: template.description || '',
      category: template.category || 'General',
      content: template.content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };
  
  const updateTemplate = (id: string, template: Partial<LetterTemplate>) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { 
        ...t, 
        ...template,
        updated_at: new Date().toISOString()
      } : t
    ));
  };
  
  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };
  
  return {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};
