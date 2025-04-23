
import React from 'react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import RecipientSelector from '@/components/communications/RecipientSelector';
import RecipientWarning from '../RecipientWarning';
import { MessageRecipientsProps } from '@/types/message-form-types';

const MessageRecipients: React.FC<MessageRecipientsProps> = ({
  selectedGroups,
  selectedAssociationId,
  onGroupsChange,
  onAssociationChange
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
          onSelectionChange={onGroupsChange} 
          associationId={selectedAssociationId}
        />
        {selectedGroups.length === 0 && <RecipientWarning />}
      </div>
    </div>
  );
};

export default MessageRecipients;
