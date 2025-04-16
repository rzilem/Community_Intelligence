
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HistoryItemProps {
  item: {
    id: number;
    action: string;
    timestamp: string;
    user: string;
    icon: React.ReactNode;
  };
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item }) => {
  return (
    <div className="flex items-start p-3 border rounded-md bg-muted/20">
      <div className="bg-muted rounded-full p-2 mr-3">
        {item.icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="font-medium">{item.action}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(item.timestamp).toLocaleString()}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">By: {item.user}</p>
      </div>
    </div>
  );
};

export default HistoryItem;
