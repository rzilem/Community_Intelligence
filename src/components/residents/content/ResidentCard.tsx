
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ResidentWithProfile } from '@/types/app-types';
import { Building, Mail, Phone, ChevronRight, Edit, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TooltipButton from '@/components/ui/tooltip-button';
import { formatDate } from '@/lib/date-utils';

interface ResidentCardProps {
  resident: ResidentWithProfile;
  onEdit: () => void;
}

export const ResidentCard: React.FC<ResidentCardProps> = ({ resident, onEdit }) => {
  const navigate = useNavigate();
  const displayName = resident.name || 
    (resident.user?.profile && `${resident.user.profile.first_name || ''} ${resident.user.profile.last_name || ''}`.trim()) ||
    'Unknown Resident';
    
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  const email = resident.email || resident.user?.profile?.email || '';
  const phone = resident.phone || resident.user?.profile?.phone_number || '';
  const profileImage = resident.user?.profile?.profile_image_url || '';

  const handleCardClick = () => {
    navigate(`/homeowners/${resident.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profileImage} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{displayName}</h3>
              <div className="text-sm text-muted-foreground capitalize">
                {resident.resident_type || 'Resident'}
                {resident.is_primary && ' (Primary)'}
              </div>
            </div>
          </div>
          <TooltipButton
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            tooltip="Edit resident"
          >
            <Edit className="h-4 w-4" />
          </TooltipButton>
        </div>
        
        <div className="space-y-2 mt-4">
          {email && (
            <div className="flex items-center text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">{email}</span>
            </div>
          )}
          
          {phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">{phone}</span>
            </div>
          )}
          
          {resident.property_id && (
            <div className="flex items-center text-sm">
              <Building className="h-3.5 w-3.5 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Property ID: {resident.property_id.substring(0, 8)}...</span>
            </div>
          )}
          
          {resident.move_in_date && (
            <div className="flex items-center text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">
                Move in: {formatDate(resident.move_in_date)}
                {resident.move_out_date ? ` to ${formatDate(resident.move_out_date)}` : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t flex justify-between">
        <Link 
          to={`/homeowners/${resident.id}/communications`}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Message
        </Link>
        <Link 
          to={`/homeowners/${resident.id}`}
          className="text-xs flex items-center text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Details <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};
