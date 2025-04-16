
import React from 'react';
import HistoryItem from './HistoryItem';

interface HistoryListProps {
  historyItems: Array<{
    id: number;
    action: string;
    timestamp: string;
    user: string;
    icon: React.ReactNode;
  }>;
}

const HistoryList: React.FC<HistoryListProps> = ({ historyItems }) => {
  return (
    <div className="space-y-4">
      {historyItems.length > 0 ? 
        historyItems.map(item => (
          <HistoryItem key={item.id} item={item} />
        )) : 
        <p className="text-muted-foreground text-center py-8">
          No history records available for this lead.
        </p>
      }
    </div>
  );
};

export default HistoryList;
