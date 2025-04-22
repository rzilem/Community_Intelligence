
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageHistoryTable } from '@/components/communications/MessageHistoryTable';
import HistorySearch from './HistorySearch';
import { MessageHistoryItem } from '@/types/message-types';

interface HistorySectionProps {
  messages: MessageHistoryItem[];
  searchHistory: string;
  onSearchChange: (value: string) => void;
  onViewMessage: (id: string) => void;
  onResendMessage: (id: string) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  messages,
  searchHistory,
  onSearchChange,
  onViewMessage,
  onResendMessage
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Message History</h2>
        <HistorySearch 
          searchValue={searchHistory} 
          onSearchChange={onSearchChange} 
        />
      </div>
      
      <Card>
        <CardContent className="p-6">
          <MessageHistoryTable />
        </CardContent>
      </Card>
    </>
  );
};

export default HistorySection;
