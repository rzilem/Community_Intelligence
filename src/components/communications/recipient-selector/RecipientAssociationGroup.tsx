
import React from 'react';
import { CheckIcon } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { RecipientGroup } from '@/types/communication-types';
import { Association } from '@/types/association-types';

interface RecipientAssociationGroupProps {
  association: Association;
  groups: RecipientGroup[];
  allSelected: boolean;
  someSelected: boolean;
  selectedGroups: string[];
  handleSelectAllForAssociation: (associationId: string, selected: boolean) => void;
  handleSelectGroup: (groupId: string) => void;
}

const RecipientAssociationGroup: React.FC<RecipientAssociationGroupProps> = ({
  association,
  groups,
  allSelected,
  someSelected,
  selectedGroups,
  handleSelectAllForAssociation,
  handleSelectGroup,
}) => {
  return (
    <div key={association.id}>
      <CommandItem 
        onSelect={() => handleSelectAllForAssociation(association.id, !allSelected)}
        className="flex items-center gap-2"
      >
        <div 
          className={`flex h-4 w-4 items-center justify-center rounded-sm border 
            ${allSelected ? 'bg-primary border-primary' : someSelected ? 'bg-primary/30 border-primary' : 'border-primary'}`}
        >
          {allSelected && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
        </div>
        <span className="font-medium">All {association.name} Groups</span>
      </CommandItem>
      {groups.map(group => (
        <CommandItem
          key={group.id}
          onSelect={() => handleSelectGroup(group.id)}
          className="pl-8"
        >
          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border mr-2 
            ${selectedGroups.includes(group.id) ? 'bg-primary border-primary' : 'border-primary'}`}
          >
            {selectedGroups.includes(group.id) && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
          </div>
          {group.name}
          <span className="ml-auto text-xs text-muted-foreground">{group.group_type}</span>
        </CommandItem>
      ))}
      <Separator className="my-1" />
    </div>
  );
};

export default RecipientAssociationGroup;
