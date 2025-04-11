
import { ResaleEvent } from '@/types/resale-event-types';

/**
 * Mock data for resale events - in a real app, this would come from the database
 */
export const getMockResaleEvents = (baseDate: Date): ResaleEvent[] => {
  return [
    {
      id: '1',
      title: 'Rush Resale Certificate - 123 Main St',
      description: 'Urgent resale certificate needed for closing',
      property: '123 Main St',
      type: 'rush_order',
      startTime: '09:00',
      endTime: '12:00',
      date: new Date(),
      color: '#EF4444',
      status: 'in_progress'
    },
    {
      id: '2',
      title: 'Resale Certificate - 456 Oak Ave',
      description: 'Standard resale certificate for property sale',
      property: '456 Oak Ave',
      type: 'normal_order',
      startTime: '13:00',
      endTime: '15:00',
      date: new Date(),
      color: '#3b6aff',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Condo Questionnaire - Riverdale Gardens',
      description: 'Comprehensive questionnaire for lender',
      property: 'Riverdale Gardens Unit 12B',
      type: 'questionnaire',
      startTime: '10:00',
      endTime: '11:30',
      date: new Date(baseDate.getTime() + 86400000), // Tomorrow
      color: '#8B5CF6',
      status: 'pending'
    },
    {
      id: '4',
      title: 'Property Inspection - 789 Pine Ln',
      description: 'Pre-sale inspection of the property',
      property: '789 Pine Ln',
      type: 'inspection',
      startTime: '14:00',
      endTime: '15:30',
      date: new Date(baseDate.getTime() + 86400000), // Tomorrow
      color: '#f97316',
      status: 'pending'
    },
    {
      id: '5',
      title: 'Document Expiration - Highland Park HOA',
      description: 'CC&Rs document needs renewal',
      property: 'Highland Park HOA',
      type: 'document_expiration',
      startTime: '09:00',
      endTime: '09:30',
      date: new Date(baseDate.getTime() + 172800000), // Day after tomorrow
      color: '#F59E0B',
      status: 'pending'
    },
    {
      id: '6',
      title: 'Document Update - Bylaws',
      description: 'Update bylaws with new amendments',
      property: 'Oakwood Heights',
      type: 'document_update',
      startTime: '11:00',
      endTime: '12:00',
      date: new Date(baseDate.getTime() + 172800000), // Day after tomorrow
      color: '#10B981',
      status: 'completed'
    }
  ];
};
