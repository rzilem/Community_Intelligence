
import React from 'react';
import { useMessageCompose } from '@/hooks/messaging/useMessageCompose';
import { MessageTypeSelector } from './compose/message-type/MessageTypeSelector';
import { MessageSubject } from './compose/content/MessageSubject';
import { MessageContent } from './compose/content/MessageContent';
import MessagePreview from './compose/MessagePreview';
import FormActions from './compose/FormActions';
import ScheduleSelector from './compose/ScheduleSelector';
import CategorySelector from './compose/CategorySelector';
import MessageRecipients from './compose/MessageRecipients';

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
      <MessageTypeSelector 
        selectedType={state.messageType}
        onTypeChange={actions.setMessageType}
      />
      
      <MessageRecipients 
        selectedGroups={state.selectedGroups}
        associationId={state.selectedAssociationId}
        onGroupsChange={actions.setSelectedGroups}
        onAssociationChange={actions.handleAssociationChange}
      />
      
      {state.previewMode ? (
        <MessagePreview 
          subject={previewSubject}
          content={previewContent}
          messageType={state.messageType}
          category={state.category}
        />
      ) : (
        <>
          <MessageSubject
            value={state.subject}
            onChange={actions.setSubject}
            onUseTemplate={onUseTemplate}
          />
          
          <MessageContent
            value={state.messageContent}
            onChange={actions.setMessageContent}
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
        isSubmitting={state.isLoading}
        canSubmit={canSend}
        isScheduled={state.scheduleMessage}
        onSubmit={actions.handleSendMessage}
        onReset={actions.handleReset}
        onPreviewToggle={actions.togglePreview}
      />
    </div>
  );
};

export default ComposeForm;
