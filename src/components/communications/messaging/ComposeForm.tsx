
import React from 'react';
import { useComposeForm } from './compose/useComposeForm';
import MessageHeader from './compose/MessageHeader';
import MessageRecipients from './compose/MessageRecipients';
import MessageContent from './compose/MessageContent';
import MessagePreview from './compose/MessagePreview';
import FormActions from './compose/FormActions';
import ScheduleSelector from './compose/ScheduleSelector';

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
    setScheduledDate,
    handleAssociationChange,
    handleSendMessage,
    handleReset,
    togglePreview,
    toggleSchedule
  } = useComposeForm({ onMessageSent });

  const canSend = Boolean(
    state.subject && 
    state.messageContent && 
    state.selectedGroups.length > 0 && 
    (!state.scheduleMessage || state.scheduledDate)
  );

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
        <>
          <MessageContent 
            subject={state.subject}
            content={state.messageContent}
            onSubjectChange={setSubject}
            onContentChange={setMessageContent}
            onUseTemplate={onUseTemplate}
          />
          
          <ScheduleSelector
            scheduleMessage={state.scheduleMessage}
            scheduledDate={state.scheduledDate}
            onToggleSchedule={toggleSchedule}
            onScheduledDateChange={setScheduledDate}
          />
        </>
      )}
      
      <FormActions 
        isPreviewMode={state.previewMode}
        togglePreview={togglePreview}
        handleReset={handleReset}
        handleSendMessage={handleSendMessage}
        canSend={canSend}
        isLoading={state.isLoading}
        isScheduled={state.scheduleMessage}
      />
    </div>
  );
};

export default ComposeForm;
