
import React from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface IntegrationCardProps {
  name: string;
  status: 'connected' | 'available' | 'coming-soon';
  description: string;
  icon: React.ReactNode;
  configDate?: string;
  onConfigure: () => void;
  onDisconnect: () => void;
  onConnect: () => void;
  /**
   * Optional URL to join a waitlist when the integration is coming soon.
   * If provided, a "Join Waitlist" button will be shown instead of a disabled
   * placeholder button.
   */
  waitlistUrl?: string;
  /**
   * When true and the integration is coming soon, the card will not render at
   * all. This allows hiding unreleased integrations while keeping the data
   * definition.
   */
  hideWhenComingSoon?: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  status,
  description,
  icon,
  configDate,
  onConfigure,
  onDisconnect,
  onConnect,
  waitlistUrl,
  hideWhenComingSoon
}) => {
  if (status === 'coming-soon' && hideWhenComingSoon) {
    return null;
  }

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
        
        <CardDescription className="pt-2 pb-4">{description}</CardDescription>
        
        <div className="flex justify-between items-end">
          {status === 'connected' && configDate && (
            <div className="text-xs text-muted-foreground">
              Last configured: {configDate}
            </div>
          )}
          
          <div className="ml-auto space-x-2">
            {status === 'connected' && (
              <>
                <Button variant="outline" size="sm" onClick={onConfigure}>Configure</Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={onDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
            {status === 'available' && (
              <Button variant="default" size="sm" onClick={onConnect}>Connect</Button>
            )}
            {status === 'coming-soon' && (
              waitlistUrl ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={waitlistUrl} target="_blank" rel="noreferrer">
                    Join Waitlist
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
