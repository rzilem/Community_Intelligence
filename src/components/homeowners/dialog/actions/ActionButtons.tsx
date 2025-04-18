
import React from 'react';
import { TooltipButton } from '@/components/ui/tooltip-button';
import { PauseCircle, ArrowUpCircle, MailX } from 'lucide-react';

interface ActionButtonsProps {
  onSubmit: (values: any) => void;
  onSpamClick: () => void;
}

const ActionButtons = ({ onSubmit, onSpamClick }: ActionButtonsProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Change Status</h4>
      <div className="flex flex-wrap gap-2">
        <TooltipButton
          tooltip="Place request on hold until more information is available"
          variant="outline"
          size="sm"
          onClick={() => onSubmit({ status: 'hold' })}
        >
          <PauseCircle className="h-4 w-4 mr-1" />
          Hold
        </TooltipButton>

        <TooltipButton
          tooltip="Escalate to board members for review and decision"
          variant="outline"
          size="sm"
          onClick={() => onSubmit({ status: 'board-review' })}
        >
          <ArrowUpCircle className="h-4 w-4 mr-1" />
          Board Review
        </TooltipButton>

        <TooltipButton
          tooltip="Mark as spam and block sender from future submissions"
          variant="destructive"
          size="sm"
          onClick={onSpamClick}
        >
          <MailX className="h-4 w-4 mr-1" />
          Mark as Spam
        </TooltipButton>
      </div>
    </div>
  );
};

export default ActionButtons;
