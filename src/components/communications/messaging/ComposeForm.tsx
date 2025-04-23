
import React from 'react';
import { useMessageCompose } from '@/hooks/messaging/useMessageCompose';
import MessageHeader from './compose/MessageHeader';
import MessageRecipients from './compose/MessageRecipients';
import MessageContent from './compose/MessageContent';
import MessagePreview from './compose/MessagePreview';
import FormActions from './compose/FormActions';
import ScheduleSelector from './compose/ScheduleSelector';
import CategorySelector from './compose/CategorySelector';

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
    actions,
    previewContent,
    previewSubject,
    categories,
    canSend
  } = useMessageCompose({
    onMessageSent
  });

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <MessageHeader 
        messageType={state.messageType} 
        onTypeChange={actions.setMessageType} 
      />
      
      <MessageRecipients 
        selectedAssociationId={state.selectedAssociationId}
        selectedGroups={state.selectedGroups}
        onAssociationChange={actions.handleAssociationChange}
        onSelectionChange={actions.setSelectedGroups}
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
            onSubjectChange={actions.setSubject}
            onContentChange={actions.setMessageContent}
            onUseTemplate={onUseTemplate}
          />
          
          <CategorySelector
            category={state.category}
            categories={categories}
            onCategoryChange={actions.setCategory}
          />
          
          <ScheduleSelector
            scheduleMessage={state.scheduleMessage}
            scheduledDate={state.scheduledDate}
            onToggleSchedule={actions.toggleSchedule}
            onScheduledDateChange={actions.setScheduledDate}
          />
        </>
      )}
      
      <FormActions 
        isPreviewMode={state.previewMode}
        togglePreview={actions.togglePreview}
        handleReset={actions.handleReset}
        handleSendMessage={actions.handleSendMessage}
        canSend={canSend}
        isLoading={state.isLoading}
        isScheduled={state.scheduleMessage}
      />
    </div>
  );
};

export default ComposeForm;
