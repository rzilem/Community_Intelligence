
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Activity, MessageSquare, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/date-utils';

interface HomeownerRequestHistoryDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string;
  parent_type: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

const HomeownerRequestHistoryDialog: React.FC<HomeownerRequestHistoryDialogProps> = ({ 
  request, 
  open, 
  onOpenChange 
}) => {
  const [user, setUser] = useState<Record<string, any>>({});

  // Fetch comments for this request
  const { data: comments = [], isLoading } = useSupabaseQuery<Comment[]>(
    'comments',
    {
      select: '*, user:profiles(first_name, last_name, email)',
      filter: [
        { column: 'parent_id', value: request?.id || '' },
        { column: 'parent_type', value: 'homeowner_request' }
      ],
      order: { column: 'created_at', ascending: false },
    },
    !!request && open
  );

  const renderCommentsList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">No comments yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-md">
            <Avatar>
              <AvatarFallback>
                {comment.user?.first_name?.[0] || 'U'}{comment.user?.last_name?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {comment.user?.first_name 
                    ? `${comment.user.first_name} ${comment.user.last_name || ''}`
                    : comment.user?.email || 'Unknown user'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at, 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <p className="mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStatusChanges = () => {
    if (!request) return null;
    
    const statusChanges = [
      {
        status: 'Created',
        date: request.createdAt,
        description: `Request was created with status "${request.status}" and priority "${request.priority}"`
      }
    ];
    
    if (request.resolvedAt) {
      statusChanges.push({
        status: 'Resolved',
        date: request.resolvedAt,
        description: 'Request was marked as resolved'
      });
    }
    
    return (
      <div className="space-y-4">
        {statusChanges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No status changes recorded</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-muted pl-6 ml-3 space-y-6">
            {statusChanges.map((change, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[31px] h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <Activity className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-medium flex justify-between">
                    <span>{change.status}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(change.date, 'MMM d, yyyy h:mm a')}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{change.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Request History</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="comments" className="flex-1 overflow-hidden">
          <TabsList>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="status">Status Changes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[50vh] pr-4">
              {renderCommentsList()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="status" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[50vh] pr-4">
              {renderStatusChanges()}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestHistoryDialog;
