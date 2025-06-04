
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComposeForm } from './compose/useComposeForm';
import MessageHeader from './compose/MessageHeader';
import MessageRecipients from './compose/MessageRecipients';
import MessageContent from './compose/MessageContent';
import FormActions from './compose/FormActions';
import MessagePreview from './compose/MessagePreview';

interface ComposeFormProps {
  onMessageSent: () => void;
  onUseTemplate: () => void;
}

const ComposeForm: React.FC<ComposeFormProps> = ({ onMessageSent, onUseTemplate }) => {
  const {
    state,
    previewContent,
    previewSubject,
    setMessageType,
    setSubject,
    setMessageContent,
    setSelectedGroups,
    handleAssociationChange,
    handleSendMessage,
    handleReset,
    togglePreview
  } = useComposeForm({ onMessageSent });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MessageHeader 
            messageType={state.messageType}
            onMessageTypeChange={setMessageType}
            previewMode={state.previewMode}
            onTogglePreview={togglePreview}
          />
          
          <MessageRecipients 
            selectedAssociationId={state.selectedAssociationId}
            selectedGroups={state.selectedGroups}
            onAssociationChange={handleAssociationChange}
            onSelectionChange={setSelectedGroups}
          />
          
          {state.previewMode ? (
            <MessagePreview 
              subject={previewSubject}
              content={previewContent}
              messageType={state.messageType}
            />
          ) : (
            <MessageContent 
              subject={state.subject}
              content={state.messageContent}
              onSubjectChange={setSubject}
              onContentChange={setMessageContent}
              onUseTemplate={onUseTemplate}
            />
          )}
          
          <FormActions 
            onSend={handleSendMessage}
            onReset={handleReset}
            isLoading={state.isLoading}
            canSend={!!(state.subject && state.messageContent && state.selectedGroups.length > 0)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ComposeForm;
