
import React, { useState, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { communicationService, RecipientGroup } from '@/services/communication-service';
import { Association } from '@/types/association-types';

interface RecipientSelectorProps {
  onSelectionChange: (selectedGroups: string[]) => void;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({ onSelectionChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectAllAssociations, setSelectAllAssociations] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all associations the user has access to
        const associationsData = await communicationService.getAllAssociations();
        setAssociations(associationsData);

        if (associationsData.length > 0) {
          // Get all association IDs
          const associationIds = associationsData.map(assoc => assoc.id);
          
          // Fetch recipient groups for all associations
          const groupsData = await communicationService.getRecipientGroupsForAssociations(associationIds);
          setRecipientGroups(groupsData);
        }
      } catch (error) {
        console.error('Error fetching recipient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    onSelectionChange(selectedGroups);
  }, [selectedGroups, onSelectionChange]);

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSelectAllForAssociation = (associationId: string, selected: boolean) => {
    const groupsForAssociation = recipientGroups.filter(group => group.association_id === associationId);
    const groupIds = groupsForAssociation.map(group => group.id);
    
    setSelectedGroups(prev => {
      if (selected) {
        // Add all groups from this association that aren't already selected
        const newSelections = groupIds.filter(id => !prev.includes(id));
        return [...prev, ...newSelections];
      } else {
        // Remove all groups from this association
        return prev.filter(id => !groupIds.includes(id));
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectAllAssociations(selected);
    
    if (selected) {
      // Select all groups
      setSelectedGroups(recipientGroups.map(group => group.id));
    } else {
      // Deselect all groups
      setSelectedGroups([]);
    }
  };

  const getGroupById = (groupId: string) => {
    return recipientGroups.find(group => group.id === groupId);
  };

  const getAssociationById = (associationId: string) => {
    return associations.find(assoc => assoc.id === associationId);
  };

  const removeGroup = (groupId: string) => {
    setSelectedGroups(prev => prev.filter(id => id !== groupId));
  };

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
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            <div className="flex flex-wrap gap-1">
              {selectedGroups.length > 0 ? (
                selectedGroups.map(groupId => {
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
                })
              ) : (
                <span className="text-muted-foreground">Select recipient groups...</span>
              )}
            </div>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search recipient groups..." />
            <CommandList>
              <CommandEmpty>No recipient groups found.</CommandEmpty>
              
              {loading ? (
                <div className="py-6 text-center text-sm">Loading recipient groups...</div>
              ) : (
                <>
                  <CommandGroup>
                    <CommandItem 
                      onSelect={() => handleSelectAll(!selectAllAssociations)}
                      className="flex items-center gap-2"
                    >
                      <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${selectAllAssociations ? 'bg-primary border-primary' : 'border-primary'}`}>
                        {selectAllAssociations && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="font-semibold">All Associations</span>
                    </CommandItem>
                  </CommandGroup>
                  
                  <CommandSeparator />
                  
                  <ScrollArea className="h-[300px]">
                    {groupedByAssociation.map(({ association, groups, allSelected, someSelected }) => (
                      <div key={association.id}>
                        <CommandGroup heading={association.name}>
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
                        </CommandGroup>
                        <Separator className="my-1" />
                      </div>
                    ))}
                  </ScrollArea>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RecipientSelector;
