
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { RefreshCw, Eye, Send, Trash2 } from 'lucide-react';
import { MessageHistoryItem } from '@/types/message-types';

export function MessageHistoryTable() {
  const [messages, setMessages] = React.useState<MessageHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleResend = (messageId: string) => {
    // Implementation would go here
    console.log(`Resend message: ${messageId}`);
  };

  const handleDelete = (messageId: string) => {
    // Implementation would go here
    console.log(`Delete message: ${messageId}`);
  };

  const handleView = (messageId: string) => {
    // Implementation would go here
    console.log(`View message: ${messageId}`);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {messages.length} messages
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Subject</th>
                <th className="text-left p-3 font-medium">Recipients</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length > 0 ? (
                messages.map((message) => (
                  <tr key={message.id} className="border-t">
                    <td className="p-3">{format(new Date(message.sentAt), 'MMM d, yyyy')}</td>
                    <td className="p-3">{message.subject}</td>
                    <td className="p-3">{message.recipientCount} recipients</td>
                    <td className="p-3">
                      <Badge variant={message.type === 'email' ? 'default' : 'outline'}>
                        {message.type === 'email' ? 'Email' : 'SMS'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          message.status === 'sent' ? 'outline' : 
                          message.status === 'scheduled' ? 'secondary' :
                          message.status === 'failed' ? 'destructive' : 'default'
                        }
                      >
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(message.id)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResend(message.id)}
                          title="Resend"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(message.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No message history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
