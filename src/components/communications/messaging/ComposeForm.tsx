
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import AssociationSelector from '@/components/associations/AssociationSelector';
import RecipientSelector from '@/components/communications/RecipientSelector';
import MessageTypeSelector from './MessageTypeSelector';
import MessageSubjectField from './MessageSubjectField';
import MessageContentField from './MessageContentField';
import RecipientWarning from './RecipientWarning';
import { communicationService } from '@/services/communication-service';
import { replaceMergeTags } from '@/utils/mergeTags';
import { ResidentType } from '@/types/resident-types';

interface ComposeFormProps {
  onMessageSent: () => void;
  onUseTemplate: () => void;
}

const ComposeForm: React.FC<ComposeFormProps> = ({ 
  onMessageSent,
  onUseTemplate
}) => {
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState({
    resident: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(512) 555-1234',
      move_in_date: '2022-06-15',
      resident_type: 'Owner' as ResidentType
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
  });

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setSelectedGroups([]); // Clear selected groups when association changes
  };

  const handleSendMessage = async () => {
    if (!subject || !messageContent || selectedGroups.length === 0) {
      toast.error('Please fill out all required fields and select at least one recipient group');
      return;
    }

    setIsLoading(true);

    try {
      // Process merge tags in content before sending
      const processedContent = replaceMergeTags(messageContent, previewData);
      const processedSubject = replaceMergeTags(subject, previewData);

      await communicationService.sendMessage({
        subject: processedSubject,
        content: processedContent,
        association_id: selectedAssociationId,
        recipient_groups: selectedGroups,
        type: messageType
      });

      // Reset form
      setSubject('');
      setMessageContent('');
      setSelectedGroups([]);
      setPreviewMode(false);
      onMessageSent();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubject('');
    setMessageContent('');
    setSelectedGroups([]);
    setPreviewMode(false);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const previewContent = previewMode 
    ? replaceMergeTags(messageContent, previewData)
    : messageContent;

  const previewSubject = previewMode
    ? replaceMergeTags(subject, previewData)
    : subject;
  
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <MessageTypeSelector 
        messageType={messageType} 
        onChange={setMessageType} 
      />
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block font-medium">Association</label>
          <AssociationSelector 
            onAssociationChange={handleAssociationChange}
            initialAssociationId={selectedAssociationId}
            label={false}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block font-medium">Recipients</label>
          </div>
          <RecipientSelector 
            onSelectionChange={setSelectedGroups} 
            associationId={selectedAssociationId}
          />
          {selectedGroups.length === 0 && <RecipientWarning />}
        </div>
      </div>
      
      {previewMode ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block font-medium">Subject</label>
          </div>
          <div className="p-3 border rounded-md">
            {previewSubject || <span className="text-muted-foreground">No subject</span>}
          </div>
        </div>
      ) : (
        <MessageSubjectField 
          subject={subject} 
          onChange={setSubject} 
          onUseTemplate={onUseTemplate} 
        />
      )}
      
      {previewMode ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block font-medium">Message Content (Preview)</label>
          </div>
          <div className="p-3 border rounded-md min-h-[300px] whitespace-pre-wrap">
            {previewContent || <span className="text-muted-foreground">No content</span>}
          </div>
        </div>
      ) : (
        <MessageContentField 
          content={messageContent} 
          onChange={setMessageContent} 
        />
      )}
      
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={togglePreview}
        >
          {previewMode ? 'Edit Message' : 'Preview with Sample Data'}
        </Button>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleReset}
          >
            Cancel
          </Button>
          <Button 
            disabled={!subject || !messageContent || selectedGroups.length === 0 || isLoading}
            onClick={handleSendMessage}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComposeForm;
