
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecipientGroup } from '@/types/communication-types';
import { Association } from '@/types/association-types';

interface SelectedGroupBadgesProps {
  selectedGroups: string[];
  recipientGroups: RecipientGroup[];
  associations: Association[];
  removeGroup: (groupId: string) => void;
}

const SelectedGroupBadges: React.FC<SelectedGroupBadgesProps> = ({
  selectedGroups,
  recipientGroups,
  associations,
  removeGroup,
}) => {
  const getGroupById = (groupId: string) => {
    return recipientGroups.find(group => group.id === groupId);
  };

  const getAssociationById = (associationId: string) => {
    return associations.find(assoc => assoc.id === associationId);
  };

  return (
    <>
      {selectedGroups.map(groupId => {
        const group = getGroupById(groupId);
        const association = group ? getAssociationById(group.association_id) : null;
        return (
          <Badge key={groupId} variant="secondary" className="mr-1 mb-1 pr-1">
            {group?.name} {association?.name ? `(${association.name})` : ''}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1" 
              onClick={(e) => {
                e.stopPropagation(); 
                removeGroup(groupId);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}
    </>
  );
};

export default SelectedGroupBadges;
