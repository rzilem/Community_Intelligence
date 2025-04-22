
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Pin, Lock } from 'lucide-react';

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  created_at: string;
}

interface TopicListProps {
  topics: ForumTopic[];
  onTopicClick: (topicId: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, onTopicClick }) => {
  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card 
          key={topic.id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onTopicClick(topic.id)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                {topic.is_pinned && <Pin className="h-4 w-4 text-muted-foreground" />}
                {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <Badge variant="secondary">
                <MessageSquare className="h-4 w-4 mr-1" />
                {topic.views_count} views
              </Badge>
            </div>
            <CardDescription>
              {new Date(topic.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {topic.content}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TopicList;
