
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, ArrowLeft } from 'lucide-react';
import { useMessages, useSendMessage, MessageThread as MessageThreadType } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadProps {
  thread: MessageThreadType;
  onBack: () => void;
}

export default function MessageThread({ thread, onBack }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useMessages(thread.id);
  const sendMessage = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage.mutateAsync({
        thread_id: thread.id,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-lg">{thread.subject}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {thread.participants.length} participants
            </p>
          </div>
          <Badge variant="outline">
            {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(
                      message.sender_profile?.first_name,
                      message.sender_profile?.last_name,
                      message.sender_profile?.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.sender_profile?.first_name && message.sender_profile?.last_name
                        ? `${message.sender_profile.first_name} ${message.sender_profile.last_name}`
                        : message.sender_profile?.email || 'Unknown User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {message.message_type !== 'text' && (
                      <Badge variant="secondary" className="text-xs">
                        {message.message_type}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="text-xs text-blue-600 hover:underline">
                            📎 {attachment.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sendMessage.isPending}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sendMessage.isPending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
