
import React from 'react';
import { formatDate } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileEdit, User, Clock } from 'lucide-react';

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
  const renderChangeItem = (key: string, value: any) => {
    if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
      // Render status changes with badges
      if (key === 'status') {
        return (
          <div className="flex items-center gap-2">
            <RenderStatusBadge status={value.old} />
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <RenderStatusBadge status={value.new} />
          </div>
        );
      }
      
      // Render priority changes with badges
      if (key === 'priority') {
        return (
          <div className="flex items-center gap-2">
            <RenderPriorityBadge priority={value.old} />
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <RenderPriorityBadge priority={value.new} />
          </div>
        );
      }
      
      // General change renderer
      return (
        <div className="flex items-center gap-2">
          <span className="line-through text-gray-500">{value.old || 'Empty'}</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span>{value.new || 'Empty'}</span>
        </div>
      );
    }
    
    // For simple values (creation events)
    return <span>{value}</span>;
  };
  
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

export const RenderStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'open':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Open</Badge>;
    case 'in-progress':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    case 'resolved':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
    case 'closed':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const RenderPriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case 'low':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>;
    case 'urgent':
      return <Badge variant="outline" className="bg-red-100 text-red-800">Urgent</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

export default HistoryItem;
