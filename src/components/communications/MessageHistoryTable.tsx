
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Mail, MessageSquare, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { MessageHistoryItem } from '@/types/message-types';

export const MessageHistoryTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageHistoryItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // This would normally come from your database
  const messages: MessageHistoryItem[] = [
    {
      id: '1',
      subject: 'Monthly Association Update',
      type: 'email',
      recipients: 45,
      sentDate: '2023-05-15T10:30:00Z',
      status: 'sent',
      openRate: 68
    },
    {
      id: '2',
      subject: 'Upcoming Pool Maintenance',
      type: 'email',
      recipients: 120,
      sentDate: '2023-05-10T14:45:00Z',
      status: 'sent',
      openRate: 72
    },
    {
      id: '3',
      subject: 'Emergency Notice: Water Outage',
      type: 'sms',
      recipients: 89,
      sentDate: '2023-05-08T09:15:00Z',
      status: 'sent'
    },
    {
      id: '4',
      subject: 'Board Meeting Reminder',
      type: 'email',
      recipients: 15,
      sentDate: '2023-05-25T18:00:00Z',
      status: 'scheduled'
    },
    {
      id: '5',
      subject: 'Annual HOA Fee Reminder',
      type: 'email',
      recipients: 132,
      sentDate: '2023-04-28T11:20:00Z',
      status: 'sent',
      openRate: 81
    }
  ];

  const filteredMessages = messages.filter(message => 
    message.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewMessage = (message: MessageHistoryItem) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const renderTypeIcon = (type: string) => {
    if (type === 'email') {
      return <Mail className="h-4 w-4 text-blue-500" />;
    } else {
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'sent') {
      return <Badge variant="success">Sent</Badge>;
    } else if (status === 'scheduled') {
      return <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No messages found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderTypeIcon(message.type)}
                      <span className="capitalize">{message.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{message.recipients}</TableCell>
                  <TableCell>
                    {format(new Date(message.sentDate), message.status === 'scheduled' ? 'MMM d, yyyy h:mm a' : 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{renderStatusBadge(message.status)}</TableCell>
                  <TableCell>
                    {message.openRate ? `${message.openRate}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewMessage(message)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Subject</h4>
                  <p>{selectedMessage.subject}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Type</h4>
                  <p className="capitalize flex items-center gap-1">
                    {renderTypeIcon(selectedMessage.type)}
                    {selectedMessage.type}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Recipients</h4>
                  <p>{selectedMessage.recipients}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Sent Date</h4>
                  <p>{format(new Date(selectedMessage.sentDate), 'PPP p')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <p>{renderStatusBadge(selectedMessage.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Open Rate</h4>
                  <p>{selectedMessage.openRate ? `${selectedMessage.openRate}%` : 'N/A'}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Message Content</h4>
                <div className="mt-2 p-3 border rounded-md bg-muted/30">
                  <p className="text-sm">
                    This is a placeholder for the actual message content. In a real implementation,
                    this would display the content of the email or SMS message that was sent.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
