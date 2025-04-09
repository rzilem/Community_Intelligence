
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Building, Mail, Phone, Calendar, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Resident } from './resident-types';
import { formatDate } from '@/lib/date-utils';

interface StandaloneResidentCardProps {
  resident: Resident;
}

const StandaloneResidentCard: React.FC<StandaloneResidentCardProps> = ({ resident }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/residents/${resident.id}`);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{resident.name}</h3>
            <p className="text-sm text-muted-foreground">
              {resident.type || 'Resident'}{resident.association ? ` • ${resident.association}` : ''}
            </p>
          </div>
          
          <div className="space-y-2">
            {resident.email && (
              <div className="flex items-center text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{resident.email}</span>
              </div>
            )}
            
            {resident.phone && (
              <div className="flex items-center text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{resident.phone}</span>
              </div>
            )}
            
            {resident.propertyAddress && (
              <div className="flex items-center text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{resident.propertyAddress}</span>
              </div>
            )}
            
            {resident.moveInDate && (
              <div className="flex items-center text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">
                  Move in: {formatDate(resident.moveInDate)}
                  {resident.moveOutDate ? ` to ${formatDate(resident.moveOutDate)}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t flex justify-between">
        <span className="text-xs text-muted-foreground">
          {resident.status || 'Active'}
        </span>
        <div className="text-xs flex items-center text-primary">
          View details <ChevronRight className="h-3 w-3 ml-1" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default StandaloneResidentCard;
