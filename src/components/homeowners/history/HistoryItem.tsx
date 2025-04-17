
import React from 'react';
import { formatDate } from '@/lib/date-utils';
import { FileEdit, User, Clock } from 'lucide-react';
import { renderChangeItem } from './utils/historyChangeRenderer';

export interface HistoryItemData {
  id: string;
  created_at: string;
  user_id?: string;
  entity_id: string;
  entity_type: string;
  change_type: string;
  changes: any;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface HistoryItemProps {
  item: HistoryItemData;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item }) => {
  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileEdit className="h-5 w-5 text-green-500" />;
      case 'updated':
        return <FileEdit className="h-5 w-5 text-blue-500" />;
      case 'commented':
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative pl-12">
      <div className="absolute left-[18px] top-1.5 transform -translate-x-1/2 rounded-full">
        {getChangeTypeIcon(item.change_type)}
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex justify-between mb-2">
          <span className="font-medium text-sm">
            {item.user?.first_name} {item.user?.last_name}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(item.created_at)}
          </span>
        </div>
        
        <h4 className="text-sm font-medium mb-2 capitalize">
          {item.change_type} request
        </h4>
        
        {item.changes && (
          <div className="space-y-2 mt-2">
            {Object.entries(item.changes).map(([key, value]) => (
              <div key={key} className="text-sm grid grid-cols-4 gap-2 items-center">
                <div className="font-medium capitalize text-gray-600 col-span-1">
                  {key.replace(/_/g, ' ')}:
                </div>
                <div className="col-span-3">
                  {renderChangeItem(key, value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryItem;
