
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth';
import { communicationIntelligenceHub } from '@/services/ai-workflow/communication-intelligence-hub';
import { CommunicationIntelligence } from '@/types/ai-workflow-types';

export const MessagesFeed: React.FC = () => {
  const { currentAssociation } = useAuth();
  const [messages, setMessages] = useState<CommunicationIntelligence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentAssociation?.id) return;
      setLoading(true);
      try {
        const data = await communicationIntelligenceHub.getIntelligenceByAssociation(currentAssociation.id);
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
                  <h4 className="font-medium truncate max-w-xs">{msg.message_content}</h4>
                  {msg.ai_category && <Badge>{msg.ai_category}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Sentiment: {msg.sentiment_score.toFixed(2)} – Urgency: {msg.urgency_level}
                </p>
                {Array.isArray(msg.suggested_responses) && msg.suggested_responses.length > 0 && (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    {msg.suggested_responses.slice(0, 2).map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesFeed;
