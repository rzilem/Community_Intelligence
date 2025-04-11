
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
      await communicationService.sendMessage({
        subject,
        content: messageContent,
        association_id: selectedAssociationId,
        recipient_groups: selectedGroups,
        type: messageType
      });

      // Reset form
      setSubject('');
      setMessageContent('');
      setSelectedGroups([]);
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
  };
  
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
      
      <MessageSubjectField 
        subject={subject} 
        onChange={setSubject} 
        onUseTemplate={onUseTemplate} 
      />
      
      <MessageContentField 
        content={messageContent} 
        onChange={setMessageContent} 
      />
      
      <div className="flex justify-end gap-3 pt-4">
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
  );
};

export default ComposeForm;
