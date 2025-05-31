
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MessageSquare, Clock } from 'lucide-react';
import { useMessageThreads, MessageThread } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadListProps {
  associationId: string;
  onSelectThread: (thread: MessageThread) => void;
  onCreateThread: () => void;
}

export default function MessageThreadList({ 
  associationId, 
  onSelectThread, 
  onCreateThread 
}: MessageThreadListProps) {
  const { data: threads = [], isLoading } = useMessageThreads(associationId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading message threads...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages ({threads.length})
          </CardTitle>
          <Button onClick={onCreateThread} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {threads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No message threads yet.</p>
            <p className="text-sm">Create a new thread to start communicating.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSelectThread(thread)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {thread.subject}
                      </h4>
                      {thread.unread_count && thread.unread_count > 0 && (
                        <Badge variant="default" className="text-xs">
                          {thread.unread_count}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                      <span>•</span>
                      <span>{thread.participants.length} participants</span>
                    </div>
                  </div>
                  <div className="flex -space-x-1">
                    {thread.participants.slice(0, 3).map((participantId, index) => (
                      <Avatar key={participantId} className="h-6 w-6 border border-background">
                        <AvatarFallback className="text-xs">
                          {index + 1}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {thread.participants.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted border border-background flex items-center justify-center text-xs text-muted-foreground">
                        +{thread.participants.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
