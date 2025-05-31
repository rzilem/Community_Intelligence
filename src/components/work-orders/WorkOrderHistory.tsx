
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, Wrench, MessageSquare } from 'lucide-react';

interface HistoryEntry {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    fieldChanged?: string;
  };
}

interface WorkOrderHistoryProps {
  workOrderId: string;
  history: HistoryEntry[];
}

export default function WorkOrderHistory({ workOrderId, history }: WorkOrderHistoryProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Wrench className="h-4 w-4 text-green-600" />;
      case 'status_change': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'assigned': return <User className="h-4 w-4 text-purple-600" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-orange-600" />;
      case 'attachment': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'status_change': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'comment': return 'bg-orange-100 text-orange-800';
      case 'attachment': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity history available.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => {
              const { date, time } = formatDate(entry.performedAt);
              return (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200">
                      {getActionIcon(entry.action)}
                    </div>
                    {index < history.length - 1 && (
                      <div className="w-px h-12 bg-gray-200 mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        by {entry.performedBy}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">{entry.description}</p>
                    
                    {entry.metadata && entry.metadata.fieldChanged && (
                      <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                        <span className="font-medium">{entry.metadata.fieldChanged}:</span>
                        {entry.metadata.oldValue && (
                          <span className="ml-1">
                            "{entry.metadata.oldValue}" → "{entry.metadata.newValue}"
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      {date} at {time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
