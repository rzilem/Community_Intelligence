
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const MessagesFeed: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Community-wide announcements and communications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b pb-4">
              <div className="flex justify-between mb-1">
                <h4 className="font-medium">Annual Meeting Reminder</h4>
                <Badge>New</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                The annual HOA meeting will be held on June 15th at 7PM in the community center. All residents are encouraged to attend.
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sent to: All Residents</span>
                <span>Posted: 1 day ago</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesFeed;
