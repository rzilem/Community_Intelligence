
import React from 'react';
import { useComposeForm } from './compose/useComposeForm';
import MessageHeader from './compose/MessageHeader';
import MessageRecipients from './compose/MessageRecipients';
import MessageContent from './compose/MessageContent';
import MessagePreview from './compose/MessagePreview';
import FormActions from './compose/FormActions';
import MessageScheduling from './compose/MessageScheduling';

interface ComposeFormProps {
  onMessageSent: () => void;
  onUseTemplate: () => void;
}

const ComposeForm: React.FC<ComposeFormProps> = ({ 
  onMessageSent,
  onUseTemplate
}) => {
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
    togglePreview,
    setIsScheduled,
    setScheduledDate,
    setScheduledTime
  } = useComposeForm({ onMessageSent });

  const canSend = Boolean(state.subject && state.messageContent && state.selectedGroups.length > 0);

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <MessageHeader 
        messageType={state.messageType} 
        onTypeChange={setMessageType} 
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
      
      {!state.previewMode && (
        <MessageScheduling
          isScheduled={state.isScheduled}
          onScheduleChange={setIsScheduled}
          scheduledDate={state.scheduledDate}
          onDateChange={setScheduledDate}
          scheduledTime={state.scheduledTime}
          onTimeChange={setScheduledTime}
        />
      )}
      
      <FormActions 
        isPreviewMode={state.previewMode}
        togglePreview={togglePreview}
        handleReset={handleReset}
        handleSendMessage={handleSendMessage}
        canSend={canSend}
        isLoading={state.isLoading}
        isScheduled={state.isScheduled}
      />
    </div>
  );
};

export default ComposeForm;
