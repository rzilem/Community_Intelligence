
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface IntegrationCardProps { 
  name: string; 
  status: 'connected' | 'available' | 'coming-soon'; 
  description: string;
  icon: React.ReactNode;
  onConfigure?: () => void;
  onDisconnect?: () => void;
  onConnect?: () => void;
  configDate?: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ 
  name, 
  status, 
  description, 
  icon,
  onConfigure,
  onDisconnect,
  onConnect,
  configDate
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-lg font-medium">{name}</h3>
          </div>
          <Badge variant={status === 'connected' ? 'default' : status === 'available' ? 'outline' : 'secondary'}>
            {status === 'connected' ? 'Connected' : status === 'available' ? 'Available' : 'Coming Soon'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        
        {status === 'connected' && configDate && (
          <p className="text-xs text-muted-foreground mt-1">Last configured: {configDate}</p>
        )}
        
        {status !== 'coming-soon' && (
          <div className="mt-4 flex justify-end space-x-2">
            {status === 'connected' && (
              <>
                <Button variant="outline" size="sm" onClick={onConfigure}>
                  Configure
                </Button>
                <Button variant="ghost" size="sm" onClick={onDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
            {status === 'available' && (
              <Button variant="outline" size="sm" onClick={onConnect}>
                Connect
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
