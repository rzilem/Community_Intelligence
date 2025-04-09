
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Building, Mail, Phone, Calendar, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Homeowner } from './homeowner-types';
import { formatDate } from '@/lib/date-utils';

interface StandaloneHomeownerCardProps {
  homeowner: Homeowner;
}

const StandaloneHomeownerCard: React.FC<StandaloneHomeownerCardProps> = ({ homeowner }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/homeowners/${homeowner.id}`);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{homeowner.name}</h3>
            <p className="text-sm text-muted-foreground">
              {homeowner.type || 'Owner'}{homeowner.property ? ` • ${homeowner.property}` : ''}
            </p>
          </div>
          
          <div className="space-y-2">
            {homeowner.email && (
              <div className="flex items-center text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{homeowner.email}</span>
              </div>
            )}
            
            {homeowner.phone && (
              <div className="flex items-center text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{homeowner.phone}</span>
              </div>
            )}
            
            {homeowner.propertyAddress && (
              <div className="flex items-center text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{homeowner.propertyAddress}</span>
              </div>
            )}
            
            {homeowner.moveInDate && (
              <div className="flex items-center text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">
                  Move in: {formatDate(homeowner.moveInDate)}
                  {homeowner.moveOutDate ? ` to ${formatDate(homeowner.moveOutDate)}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t flex justify-between">
        <span className="text-xs text-muted-foreground">
          {homeowner.balance > 0 
            ? <span className="text-red-600 font-medium">${homeowner.balance.toFixed(2)} balance</span>
            : 'Account current'}
        </span>
        <div className="text-xs flex items-center text-primary">
          View details <ChevronRight className="h-3 w-3 ml-1" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default StandaloneHomeownerCard;
