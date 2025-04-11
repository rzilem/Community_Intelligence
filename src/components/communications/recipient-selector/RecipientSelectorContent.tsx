
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommandEmpty, CommandGroup, CommandInput, CommandList, CommandSeparator } from '@/components/ui/command';
import { RecipientGroup } from '@/types/communication-types';
import { Association } from '@/types/association-types';
import RecipientCommonGroups from './RecipientCommonGroups';
import RecipientAssociationGroup from './RecipientAssociationGroup';

interface RecipientSelectorContentProps {
  loading: boolean;
  recipientGroups: RecipientGroup[];
  selectedGroups: string[];
  associations: Association[];
  selectAllAssociations: boolean;
  handleSelectCommonType: (groupType: string) => void;
  handleSelectAll: (selected: boolean) => void;
  handleSelectAllForAssociation: (associationId: string, selected: boolean) => void;
  handleSelectGroup: (groupId: string) => void;
  showAssociationGroups?: boolean; // New prop to control showing association groups
}

const RecipientSelectorContent: React.FC<RecipientSelectorContentProps> = ({
  loading,
  recipientGroups,
  selectedGroups,
  associations,
  selectAllAssociations,
  handleSelectCommonType,
  handleSelectAll,
  handleSelectAllForAssociation,
  handleSelectGroup,
  showAssociationGroups = true, // Default to showing all associations
}) => {
  const groupedByAssociation = associations.map(association => {
    const groups = recipientGroups.filter(group => group.association_id === association.id);
    const allGroupsSelected = groups.length > 0 && groups.every(group => selectedGroups.includes(group.id));
    const someGroupsSelected = groups.some(group => selectedGroups.includes(group.id));
    
    return {
      association,
      groups,
      allSelected: allGroupsSelected,
      someSelected: someGroupsSelected && !allGroupsSelected
    };
  });

  return (
    <CommandList>
      <CommandInput placeholder="Search recipient groups..." />
      <CommandEmpty>No recipient groups found.</CommandEmpty>
      
      {loading ? (
        <div className="py-6 text-center text-sm">Loading recipient groups...</div>
      ) : (
        <>
          {/* Common recipient types section */}
          <CommandGroup heading="Common Recipients">
            <RecipientCommonGroups
              recipientGroups={recipientGroups}
              selectedGroups={selectedGroups}
              selectAllAssociations={selectAllAssociations}
              handleSelectCommonType={handleSelectCommonType}
              handleSelectAll={handleSelectAll}
            />
          </CommandGroup>
          
          {showAssociationGroups && (
            <>
              <CommandSeparator />
              
              <ScrollArea className="h-[300px]">
                {groupedByAssociation.map(({ association, groups, allSelected, someSelected }) => (
                  <CommandGroup key={association.id} heading={association.name}>
                    <RecipientAssociationGroup
                      association={association}
                      groups={groups}
                      allSelected={allSelected}
                      someSelected={someSelected}
                      selectedGroups={selectedGroups}
                      handleSelectAllForAssociation={handleSelectAllForAssociation}
                      handleSelectGroup={handleSelectGroup}
                    />
                  </CommandGroup>
                ))}
              </ScrollArea>
            </>
          )}
        </>
      )}
    </CommandList>
  );
};

export default RecipientSelectorContent;
