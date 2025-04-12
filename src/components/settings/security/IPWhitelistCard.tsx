
import React from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface IPWhitelistCardProps {
  ipAddresses: string[];
  onRemoveIP: (ip: string) => void;
}

const IPWhitelistCard: React.FC<IPWhitelistCardProps> = ({ 
  ipAddresses, 
  onRemoveIP 
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>IP Whitelist</CardTitle>
        </div>
        <CardDescription>
          Restrict access to trusted IP addresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ipAddresses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ipAddresses.map((ip) => (
              <Badge key={ip} variant="secondary" className="px-3 py-1">
                {ip}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 ml-1 p-0" 
                  onClick={() => onRemoveIP(ip)}
                >
                  ✕
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No IP addresses in the whitelist.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">Add IP Address</Button>
      </CardFooter>
    </Card>
  );
};

export default IPWhitelistCard;
