
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth';
import { communicationIntelligenceHub } from '@/services/ai-workflow/communication-intelligence-hub';
import { CommunicationInsight } from '@/services/ai-workflow/communication-intelligence-hub-mock';

export const MessagesFeed: React.FC = () => {
  const { currentAssociation } = useAuth();
  const [messages, setMessages] = useState<CommunicationInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentAssociation?.id) return;
      setLoading(true);
      try {
        const data = await communicationIntelligenceHub.generateInsights(currentAssociation.id);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load message intelligence', err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [currentAssociation?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Community-wide announcements and communications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className="border-b pb-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-medium truncate max-w-xs">{msg.message}</h4>
                  <Badge>{msg.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Confidence: {Math.round(msg.confidence * 100)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesFeed;
