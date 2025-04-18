
import React from 'react';
import { TooltipButton } from '@/components/ui/tooltip-button';
import { PauseCircle, ArrowUpCircle, MailX } from 'lucide-react';

interface ActionButtonsProps {
  onSubmit: (values: any) => void;
  onSpamClick: () => void;
}

const ActionButtons = ({ onSubmit, onSpamClick }: ActionButtonsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <TooltipButton
        tooltip="Place request on hold"
        variant="outline"
        onClick={() => onSubmit({ status: 'hold' })}
      >
        <PauseCircle />
        Hold
      </TooltipButton>

      <TooltipButton
        tooltip="Send to board for review"
        variant="outline"
        onClick={() => onSubmit({ status: 'board-review' })}
      >
        <ArrowUpCircle />
        Board Review
      </TooltipButton>

      <TooltipButton
        tooltip="Mark as spam"
        variant="destructive"
        onClick={onSpamClick}
      >
        <MailX />
        Mark as Spam
      </TooltipButton>
    </div>
  );
};

export default ActionButtons;
