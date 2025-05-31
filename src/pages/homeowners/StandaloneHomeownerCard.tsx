
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Mail, Phone } from 'lucide-react';
import { Homeowner } from './homeowner-types';

interface StandaloneHomeownerCardProps {
  homeowner: Homeowner;
}

const StandaloneHomeownerCard: React.FC<StandaloneHomeownerCardProps> = ({ homeowner }) => {
  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'active': 'default',
      'inactive': 'secondary',
      'pending-approval': 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{homeowner.name}</CardTitle>
          {getStatusBadge(homeowner.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{homeowner.email}</span>
          </div>
          {homeowner.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{homeowner.phone}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Property</p>
          <p className="text-sm text-muted-foreground">
            {homeowner.propertyAddress || homeowner.property}
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Association</p>
          <p className="text-sm text-muted-foreground">
            {homeowner.associationName || homeowner.association}
          </p>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandaloneHomeownerCard;
