
import { useState } from 'react';
import { replaceMergeTags } from '@/utils/mergeTags';
import { MessagePreviewData } from '@/types/messaging-types';

export interface MessagePreviewOptions {
  subject: string;
  messageContent: string;
  initialPreviewMode?: boolean;
}

export interface MessagePreviewHook {
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  togglePreview: () => void;
  previewContent: string;
  previewSubject: string;
  previewData: MessagePreviewData;
}

/**
 * Handles preview mode for message subject and content with merge tags.
 */
export function useMessagePreview({ 
  subject, 
  messageContent,
  initialPreviewMode = false 
}: MessagePreviewOptions): MessagePreviewHook {
  const [previewMode, setPreviewMode] = useState<boolean>(initialPreviewMode);

  // Dummy data for merge tag preview
  const previewData: MessagePreviewData = {
    resident: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(512) 555-1234',
      move_in_date: '2022-06-15',
      resident_type: 'Owner'
    },
    property: {
      address: '123 Oak Lane',
      unit_number: '4B',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      property_type: 'Condo',
      square_feet: 1250
    },
    association: {
      name: 'Oakridge Estates',
      contact_email: 'info@oakridgeestates.org',
      phone: '(512) 555-9000',
      website: 'www.oakridgeestates.org',
      address: '500 Main Street, Suite 300',
      city: 'Austin',
      state: 'TX',
      zip: '78701'
    },
    payment: {
      amount: 350,
      dueDate: new Date('2025-05-01'),
      lateFee: 25,
      pastDue: 725
    },
    compliance: {
      violation: 'Landscaping',
      fine: 100,
      deadline: new Date('2025-05-15')
    }
  };

  const togglePreview = () => setPreviewMode(pm => !pm);

  const previewContent = previewMode
    ? replaceMergeTags(messageContent, previewData)
    : messageContent;

  const previewSubject = previewMode
    ? replaceMergeTags(subject, previewData)
    : subject;

  return {
    previewMode,
    setPreviewMode,
    togglePreview,
    previewContent,
    previewSubject,
    previewData
  };
}
