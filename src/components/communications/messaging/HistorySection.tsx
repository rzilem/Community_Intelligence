
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import HistorySearch from './HistorySearch';
import MessageHistoryTable from '../MessageHistoryTable';
import { messageService, MessageHistory } from '@/services/communications/message-service';
import { toast } from 'sonner';

interface HistorySectionProps {
  messages: MessageHistory[];
  searchHistory: string;
  onSearchChange: (search: string) => void;
  onViewMessage: (id: string) => void;
  onResendMessage: (id: string) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  messages: propMessages,
  searchHistory,
  onSearchChange,
  onViewMessage,
  onResendMessage
}) => {
  const [messages, setMessages] = useState<MessageHistory[]>(propMessages);
  const [isLoading, setIsLoading] = useState(false);

  // Load real message history on component mount
  useEffect(() => {
    loadMessageHistory();
  }, []);

  const loadMessageHistory = async () => {
    setIsLoading(true);
    try {
      const history = await messageService.getMessageHistory();
      setMessages(history);
    } catch (error) {
      console.error('Error loading message history:', error);
      toast.error('Failed to load message history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMessageHistory();
  };

  const handleResend = async (id: string) => {
    try {
      await messageService.resendMessage(id);
      // Refresh the history to show the new message
      await loadMessageHistory();
    } catch (error) {
      // Error handling is done in the service
    }
  };

  // Filter messages based on search
  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchHistory.toLowerCase()) ||
    message.content.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Message History</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <HistorySearch 
            searchHistory={searchHistory}
            onSearchChange={onSearchChange}
          />
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading message history...</p>
            </div>
          ) : (
            <MessageHistoryTable 
              messages={filteredMessages}
              onViewMessage={onViewMessage}
              onResend={handleResend}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistorySection;
