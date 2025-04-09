import React from 'react';
import { Homeowner } from './homeowner-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Building, Calendar, DollarSign, CreditCard } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';
import { useNavigate } from 'react-router-dom';
import { getStatusBadge, getHomeownerTypeBadge, formatCurrency, formatDate } from './homeowner-utils';

interface HomeownerCardProps {
  homeowner: Homeowner;
}

const StandaloneHomeownerCard: React.FC<HomeownerCardProps> = ({ homeowner }) => {
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleViewHomeowner = () => {
    navigate(`/homeowners/${homeowner.id}`);
  };

  return (
    <Card className="shadow-sm card-hover cursor-pointer" onClick={handleViewHomeowner}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={homeowner.avatarUrl} />
              <AvatarFallback>{getInitials(homeowner.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{homeowner.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                {homeowner.propertyAddress}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(homeowner.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Unit:</div>
          <div className="font-medium">{homeowner.unitNumber || '-'}</div>
          
          <div className="text-muted-foreground">Email:</div>
          <div className="font-medium flex items-center">
            <Mail className="h-3 w-3 mr-1" /> <span className="truncate">{homeowner.email}</span>
          </div>
          
          <div className="text-muted-foreground">Phone:</div>
          <div className="font-medium flex items-center">
            <Phone className="h-3 w-3 mr-1" /> {homeowner.phone}
          </div>
          
          <div className="text-muted-foreground">HOA:</div>
          <div className="font-medium">{homeowner.association}</div>
          
          <div className="text-muted-foreground">Balance:</div>
          <div className="font-medium flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            {formatCurrency(homeowner.balance)}
          </div>
          
          <div className="text-muted-foreground">Last Payment:</div>
          <div className="font-medium flex items-center">
            <CreditCard className="h-3 w-3 mr-1" />
            {homeowner.lastPayment ? `${formatCurrency(homeowner.lastPayment.amount)} on ${formatDate(homeowner.lastPayment.date)}` : '-'}
          </div>
          
          <div className="text-muted-foreground">Move-in:</div>
          <div className="font-medium flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(homeowner.moveInDate)}
          </div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <TooltipButton size="sm" variant="ghost" tooltip="View homeowner details">
            Details
          </TooltipButton>
          <TooltipButton size="sm" variant="outline" tooltip="Edit homeowner information">
            Edit
          </TooltipButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandaloneHomeownerCard;
