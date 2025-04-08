
import React from 'react';
import { Resident } from './resident-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';
import { useNavigate } from 'react-router-dom';
import { getStatusBadge, getResidentTypeBadge } from './resident-utils';

interface ResidentCardProps {
  resident: Resident;
}

const StandaloneResidentCard: React.FC<ResidentCardProps> = ({ resident }) => {
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleViewResident = () => {
    navigate(`/residents/${resident.id}`);
  };

  return (
    <Card className="shadow-sm card-hover cursor-pointer" onClick={handleViewResident}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={resident.avatarUrl} />
              <AvatarFallback>{getInitials(resident.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{resident.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                {resident.propertyAddress}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(resident.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Type:</div>
          <div className="font-medium">{getResidentTypeBadge(resident.type)}</div>
          
          <div className="text-muted-foreground">Email:</div>
          <div className="font-medium flex items-center">
            <Mail className="h-3 w-3 mr-1" /> <span className="truncate">{resident.email}</span>
          </div>
          
          <div className="text-muted-foreground">Phone:</div>
          <div className="font-medium flex items-center">
            <Phone className="h-3 w-3 mr-1" /> {resident.phone}
          </div>
          
          <div className="text-muted-foreground">HOA:</div>
          <div className="font-medium">{resident.association}</div>
          
          <div className="text-muted-foreground">Move-in Date:</div>
          <div className="font-medium">{new Date(resident.moveInDate).toLocaleDateString()}</div>
          
          <div className="text-muted-foreground">Property ID:</div>
          <div className="font-medium">{resident.propertyId}</div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <TooltipButton size="sm" variant="ghost" tooltip="View resident details">
            Details
          </TooltipButton>
          <TooltipButton size="sm" variant="outline" tooltip="Edit resident information">
            Edit
          </TooltipButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandaloneResidentCard;
