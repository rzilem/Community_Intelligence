
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface HomeownerHeaderProps {
  id: string;
  name?: string;
  avatarUrl?: string;
  status?: string;
  tags?: string[];
  violations?: string[];
  onProfileImageUpdated?: (url: string) => void;
  onEditClick?: () => void;
}

export const HomeownerHeader: React.FC<HomeownerHeaderProps> = ({
  id,
  name,
  avatarUrl,
  status = '',
  tags = [],
  violations = [],
  onProfileImageUpdated,
  onEditClick
}) => {
  const { userRole, isAdmin } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '??';
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending-approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center">
      <div className="relative flex-shrink-0">
        <Avatar className="h-20 w-20">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name || 'Homeowner'} />
          ) : null}
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="ml-4 flex-grow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{name || 'Unnamed Homeowner'}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              {status && (
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusColor(status)}`}>
                  {status}
                </span>
              )}
              {tags && tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {violations && violations.map((violation, index) => (
                <span key={index} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {violation}
                </span>
              ))}
            </div>
          </div>
          
          {isAdmin && onEditClick && (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto" 
              onClick={onEditClick}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
