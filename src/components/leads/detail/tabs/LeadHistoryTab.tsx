
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClockIcon, UserIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

const LeadHistoryTab: React.FC = () => {
  // This is a placeholder component that would be connected to real data
  const historyItems = [
    { 
      id: 1, 
      action: 'Lead created', 
      timestamp: '2025-04-16T14:30:00Z', 
      user: 'John Doe',
      icon: <UserIcon className="h-4 w-4 text-blue-500" />
    },
    { 
      id: 2, 
      action: 'Status changed to Contacted', 
      timestamp: '2025-04-16T15:45:00Z', 
      user: 'Emily Smith',
      icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />
    },
    { 
      id: 3, 
      action: 'Note added', 
      timestamp: '2025-04-16T16:20:00Z', 
      user: 'John Doe',
      icon: <ClockIcon className="h-4 w-4 text-purple-500" />
    },
    { 
      id: 4, 
      action: 'Email sent', 
      timestamp: '2025-04-16T17:10:00Z', 
      user: 'System',
      icon: <XCircleIcon className="h-4 w-4 text-orange-500" />
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Lead Activity History</h3>
        
        {historyItems.length > 0 ? (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div key={item.id} className="flex items-start p-3 border rounded-md bg-muted/20">
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
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No history records available for this lead.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadHistoryTab;
