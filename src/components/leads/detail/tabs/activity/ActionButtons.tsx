
import React from 'react';
import { Button } from '@/components/ui/button';
import { MailIcon, CalendarIcon } from 'lucide-react';

const ActionButtons: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" className="flex items-center gap-2">
        <MailIcon className="h-4 w-4" />
        Send Email
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4" />
        Schedule Meeting
      </Button>
    </div>
  );
};

export default ActionButtons;
