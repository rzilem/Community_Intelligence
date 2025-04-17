
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HomeownerRequestComment } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';

interface CommentsTabProps {
  comments: HomeownerRequestComment[];
  loadingComments: boolean;
}

const CommentsTab: React.FC<CommentsTabProps> = ({ comments, loadingComments }) => {
  return (
    <ScrollArea className="h-[60vh]">
      <div className="p-4">
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="font-medium text-lg mb-4">Comments &amp; Updates</h3>
          
          {loadingComments ? (
            <div className="text-center py-4">Loading comments...</div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-md p-3 bg-gray-50">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span className="font-medium">
                      {comment.user?.first_name} {comment.user?.last_name || ''}
                    </span>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-4">
              No comments available for this request.
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default CommentsTab;
