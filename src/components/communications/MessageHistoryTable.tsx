
import React from 'react';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  RotateCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface MessageHistoryItem {
  id: string;
  subject: string;
  type: 'email' | 'sms';
  recipients: number;
  sentDate: string;
  status: 'sent' | 'scheduled' | 'failed';
  openRate?: number;
}

interface MessageHistoryTableProps {
  messages: MessageHistoryItem[];
  onViewMessage: (id: string) => void;
  onResend: (id: string) => void;
}

const MessageHistoryTable: React.FC<MessageHistoryTableProps> = ({
  messages,
  onViewMessage,
  onResend
}) => {
  if (messages.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No messages in history yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Recipients</TableHead>
            <TableHead>Sent Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">{message.subject}</TableCell>
              <TableCell>
                <span className="inline-flex items-center">
                  {message.type === 'email' ? (
                    <><Mail className="h-4 w-4 mr-1" /> Email</>
                  ) : (
                    <><MessageSquare className="h-4 w-4 mr-1" /> SMS</>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-center">{message.recipients}</TableCell>
              <TableCell>{message.sentDate}</TableCell>
              <TableCell>
                {message.status === 'sent' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 w-fit">
                    <CheckCircle className="h-3 w-3" />
                    Sent {message.openRate && `(${message.openRate}% opened)`}
                  </Badge>
                )}
                {message.status === 'scheduled' && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 w-fit">
                    <Clock className="h-3 w-3" />
                    Scheduled
                  </Badge>
                )}
                {message.status === 'failed' && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 w-fit">
                    <AlertCircle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewMessage(message.id)}
                    title="View message"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {message.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onResend(message.id)}
                      title="Resend message"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MessageHistoryTable;
