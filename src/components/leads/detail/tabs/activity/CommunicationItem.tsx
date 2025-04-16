
import React from 'react';
import { MailIcon, PhoneIcon, CalendarIcon, MessageSquareIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface CommunicationItemProps {
  communication: {
    id: number;
    type: string;
    subject: string;
    content: string;
    date: string;
    from: string;
    to: string;
  };
}

const CommunicationItem: React.FC<CommunicationItemProps> = ({ communication }) => {
  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MailIcon className="h-5 w-5 text-blue-500" />;
      case 'call':
        return <PhoneIcon className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageSquareIcon className="h-5 w-5 text-purple-500" />;
      case 'meeting':
        return <CalendarIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <MessageSquareIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="border rounded-md overflow-hidden mb-4">
      <div className="flex items-center justify-between bg-muted/30 p-3 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full">
            {getCommunicationIcon(communication.type)}
          </div>
          <div>
            <h4 className="font-medium">{communication.subject}</h4>
            <p className="text-sm text-muted-foreground">
              {formatDate(communication.date)}
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {communication.type === 'email' ? (
            <span>From: {communication.from} To: {communication.to}</span>
          ) : (
            <span>Between {communication.from} and {communication.to}</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm">{communication.content}</p>
      </div>
    </div>
  );
};

export default CommunicationItem;
