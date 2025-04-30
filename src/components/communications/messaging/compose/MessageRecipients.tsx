
import React from 'react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import RecipientSelector from '@/components/communications/RecipientSelector';
import RecipientWarning from '../RecipientWarning';

interface MessageRecipientsProps {
  selectedAssociationId: string;
  selectedGroups: string[];
  onAssociationChange: (associationId: string) => void;
  onSelectionChange: (selectedGroups: string[]) => void;
}

const MessageRecipients: React.FC<MessageRecipientsProps> = ({
  selectedAssociationId,
  selectedGroups,
  onAssociationChange,
  onSelectionChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block font-medium">Association</label>
        <AssociationSelector 
          onAssociationChange={onAssociationChange}
          initialAssociationId={selectedAssociationId}
          label={false}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block font-medium">Recipients</label>
        </div>
        <RecipientSelector 
          onSelectionChange={onSelectionChange} 
          associationId={selectedAssociationId}
        />
        {selectedGroups.length === 0 && <RecipientWarning />}
      </div>
    </div>
  );
};

export default MessageRecipients;
