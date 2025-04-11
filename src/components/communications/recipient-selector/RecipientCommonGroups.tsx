
import React from 'react';
import { CheckIcon, Users, Home, Star } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';
import { RecipientGroup } from '@/types/communication-types';

interface RecipientCommonGroupsProps {
  recipientGroups: RecipientGroup[];
  selectedGroups: string[];
  selectAllAssociations: boolean;
  handleSelectCommonType: (groupType: string) => void;
  handleSelectAll: (selected: boolean) => void;
}

const RecipientCommonGroups: React.FC<RecipientCommonGroupsProps> = ({
  recipientGroups,
  selectedGroups,
  selectAllAssociations,
  handleSelectCommonType,
  handleSelectAll,
}) => {
  // Check if all owners or all residents are selected
  const areAllOwnersSelected = () => {
    const ownerGroups = recipientGroups.filter(group => 
      group.name.toLowerCase().includes('owner')
    );
    return ownerGroups.length > 0 && ownerGroups.every(group => 
      selectedGroups.includes(group.id)
    );
  };
  
  const areAllResidentsSelected = () => {
    const residentGroups = recipientGroups.filter(group => 
      group.name.toLowerCase().includes('resident')
    );
    return residentGroups.length > 0 && residentGroups.every(group => 
      selectedGroups.includes(group.id)
    );
  };

  return (
    <>
      <CommandItem 
        onSelect={() => handleSelectCommonType('owner')}
        className="flex items-center gap-2"
      >
        <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${areAllOwnersSelected() ? 'bg-primary border-primary' : 'border-primary'}`}>
          {areAllOwnersSelected() && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
        </div>
        <Home className="h-4 w-4 mr-1 text-blue-600" />
        <span className="font-medium">All Owners</span>
      </CommandItem>
      
      <CommandItem 
        onSelect={() => handleSelectCommonType('resident')}
        className="flex items-center gap-2"
      >
        <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${areAllResidentsSelected() ? 'bg-primary border-primary' : 'border-primary'}`}>
          {areAllResidentsSelected() && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
        </div>
        <Users className="h-4 w-4 mr-1 text-green-600" />
        <span className="font-medium">All Residents</span>
      </CommandItem>
      
      <CommandItem 
        onSelect={() => handleSelectAll(!selectAllAssociations)}
        className="flex items-center gap-2"
      >
        <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${selectAllAssociations ? 'bg-primary border-primary' : 'border-primary'}`}>
          {selectAllAssociations && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
        </div>
        <Star className="h-4 w-4 mr-1 text-amber-500" />
        <span className="font-medium">All Recipients</span>
      </CommandItem>
    </>
  );
};

export default RecipientCommonGroups;
