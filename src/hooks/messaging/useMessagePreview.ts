
import { useState, useMemo } from 'react';
import { MessagePreviewData } from '@/types/messaging-types';
import { replaceMergeTags } from '@/utils/mergeTags';

export interface UseMessagePreviewOptions {
  initialContent?: string;
  initialSubject?: string;
  content?: string;
  subject?: string;
  previewData?: Partial<MessagePreviewData>;
}

export interface UseMessagePreviewReturn {
  previewMode: boolean;
  previewContent: string;
  previewSubject: string;
  togglePreview: () => void;
  setPreviewMode: (mode: boolean) => void;
  updatePreviewData: (data: Partial<MessagePreviewData>) => void;
  previewData: MessagePreviewData;
}

/**
 * Default preview data for message templates
 */
const defaultPreviewData: MessagePreviewData = {
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

/**
 * Hook for message preview functionality with merge tag support
 */
export function useMessagePreview({
  initialContent = '',
  initialSubject = '',
  previewData: customPreviewData = {}
}: UseMessagePreviewOptions = {}): UseMessagePreviewReturn {
  const [content, setContent] = useState(initialContent);
  const [subject, setSubject] = useState(initialSubject);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Merge custom preview data with defaults
  const [previewData, setPreviewData] = useState<MessagePreviewData>(
    mergePreviewData(defaultPreviewData, customPreviewData)
  );
  
  // Update content/subject when props change
  useMemo(() => {
    setContent(initialContent);
    setSubject(initialSubject);
  }, [initialContent, initialSubject]);
  
  const togglePreview = () => setPreviewMode(prev => !prev);
  
  const updatePreviewData = (data: Partial<MessagePreviewData>) => {
    setPreviewData(prev => mergePreviewData(prev, data));
  };
  
  // Apply merge tags if preview mode is enabled
  const previewContent = useMemo(() => 
    previewMode ? replaceMergeTags(content, previewData) : content
  , [content, previewMode, previewData]);
  
  const previewSubject = useMemo(() => 
    previewMode ? replaceMergeTags(subject, previewData) : subject
  , [subject, previewMode, previewData]);
  
  return {
    previewMode,
    previewContent,
    previewSubject,
    togglePreview,
    setPreviewMode,
    updatePreviewData,
    previewData
  };
}

/**
 * Helper function to merge preview data objects
 */
function mergePreviewData(
  baseData: MessagePreviewData, 
  overrideData: Partial<MessagePreviewData>
): MessagePreviewData {
  return {
    resident: { ...baseData.resident, ...overrideData.resident },
    property: { ...baseData.property, ...overrideData.property },
    association: { ...baseData.association, ...overrideData.association },
    payment: { ...baseData.payment, ...overrideData.payment },
    compliance: { ...baseData.compliance, ...overrideData.compliance },
  };
}
