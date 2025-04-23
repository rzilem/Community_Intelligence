
import React from 'react';
import { useMessageContext } from '@/contexts/message/MessageContext';
import { MessageTypeSelector } from './compose/message-type/MessageTypeSelector';
import { MessageSubject } from './compose/content/MessageSubject';
import { MessageContent } from './compose/content/MessageContent';
import MessagePreview from './compose/MessagePreview';
import FormActions from './compose/FormActions';
import ScheduleSelector from './compose/ScheduleSelector';
import CategorySelector from './compose/CategorySelector';
import MessageRecipients from './compose/MessageRecipients';
import { useMessageService } from '@/hooks/messaging/useMessageService';
import { MESSAGE_CATEGORIES } from '@/hooks/messaging/useMessageCategory';

interface ComposeFormProps {
  onMessageSent: () => void;
  onUseTemplate: () => void;
}

const ComposeForm: React.FC<ComposeFormProps> = ({ 
  onMessageSent,
  onUseTemplate
}) => {
  const {
    messageType,
    subject,
    content,
    selectedGroups,
    selectedAssociationId,
    category,
    isScheduled,
    scheduledDate,
    previewMode,
    setMessageType,
    setSubject,
    setContent,
    setSelectedGroups,
    setSelectedAssociationId,
    setCategory,
    toggleSchedule,
    setScheduledDate,
    togglePreview,
    reset
  } = useMessageContext();

  const { sendMessage, isLoading } = useMessageService();

  const handleSendMessage = async () => {
    await sendMessage({
      subject,
      content,
      type: messageType,
      association_id: selectedAssociationId,
      recipient_groups: selectedGroups,
      scheduled_date: isScheduled ? scheduledDate?.toISOString() : undefined,
      category
    });
    onMessageSent();
    reset();
  };

  const canSend = Boolean(
    subject && 
    content && 
    selectedGroups.length > 0 && 
    (!isScheduled || scheduledDate)
  );

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <MessageTypeSelector 
        selectedType={messageType}
        onTypeChange={setMessageType}
      />
      
      <MessageRecipients 
        selectedGroups={selectedGroups}
        selectedAssociationId={selectedAssociationId}
        onGroupsChange={setSelectedGroups}
        onAssociationChange={setSelectedAssociationId}
      />
      
      {previewMode ? (
        <MessagePreview 
          subject={subject}
          content={content}
          type={messageType}
          category={category}
        />
      ) : (
        <>
          <MessageSubject
            value={subject}
            onChange={setSubject}
            onUseTemplate={onUseTemplate}
          />
          
          <MessageContent
            value={content}
            onChange={setContent}
          />
          
          <CategorySelector
            category={category}
            categories={MESSAGE_CATEGORIES}
            onCategoryChange={setCategory}
          />
          
          <ScheduleSelector
            scheduleMessage={isScheduled}
            scheduledDate={scheduledDate}
            onToggleSchedule={toggleSchedule}
            onScheduledDateChange={setScheduledDate}
          />
        </>
      )}
      
      <FormActions 
        isSubmitting={isLoading}
        canSubmit={canSend}
        isScheduled={isScheduled}
        onSubmit={handleSendMessage}
        onReset={reset}
        onPreviewToggle={togglePreview}
      />
    </div>
  );
};

export default ComposeForm;
