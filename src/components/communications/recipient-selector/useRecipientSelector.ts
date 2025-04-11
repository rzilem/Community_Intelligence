
import { useState, useEffect } from 'react';
import { communicationService } from '@/services/communication-service';
import { RecipientGroup } from '@/types/communication-types';
import { Association } from '@/types/association-types';

// Commonly used recipient group types
const COMMON_GROUP_TYPES = ['owners', 'residents'];

export const useRecipientSelector = (
  onSelectionChange: (selectedGroups: string[]) => void,
  associationId?: string // New param to filter by association
) => {
  const [open, setOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectAllAssociations, setSelectAllAssociations] = useState(false);
  
  // State to track common groups for quick access
  const [commonGroups, setCommonGroups] = useState<{id: string, name: string, associationName: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch associations based on whether we have a specific associationId
        let associationsData: Association[] = [];
        
        if (associationId) {
          // If we have an associationId, only fetch that one association
          const association = await communicationService.getAssociationById(associationId);
          if (association) {
            associationsData = [association];
          }
        } else {
          // Otherwise fetch all associations the user has access to
          associationsData = await communicationService.getAllAssociations();
        }
        
        setAssociations(associationsData);

        if (associationsData.length > 0) {
          // Get all association IDs or just the one selected
          const assocIds = associationId ? [associationId] : associationsData.map(assoc => assoc.id);
          
          // Fetch recipient groups for the selected association(s)
          let groupsData: any[] = [];
          
          if (associationId) {
            groupsData = await communicationService.getRecipientGroups(associationId);
          } else {
            groupsData = await communicationService.getRecipientGroupsForAssociations(assocIds);
          }
          
          // Ensure group_type is 'system' or 'custom'
          const typedRecipientGroups: RecipientGroup[] = groupsData.map(group => ({
            ...group,
            group_type: group.group_type === 'system' ? 'system' : 'custom'
          }));
          
          setRecipientGroups(typedRecipientGroups);
          
          // Identify common groups (owners and residents)
          const commonGroupsData = typedRecipientGroups.filter(group => 
            COMMON_GROUP_TYPES.some(type => 
              group.name.toLowerCase().includes(type)
            )
          );
          
          // Format common groups for display
          setCommonGroups(commonGroupsData.map(group => {
            const association = associationsData.find(a => a.id === group.association_id);
            return {
              id: group.id,
              name: group.name,
              associationName: association?.name || ''
            };
          }));
        }
      } catch (error) {
        console.error('Error fetching recipient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [associationId]); // Re-fetch when associationId changes

  useEffect(() => {
    onSelectionChange(selectedGroups);
  }, [selectedGroups, onSelectionChange]);

  // Clear selected groups when associationId changes
  useEffect(() => {
    setSelectedGroups([]);
  }, [associationId]);

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
  
  // Handler for selecting common group types across all associations
  const handleSelectCommonType = (groupType: string) => {
    const matchingGroups = recipientGroups.filter(group => 
      group.name.toLowerCase().includes(groupType.toLowerCase())
    );
    
    if (!matchingGroups.length) return;
    
    const matchingGroupIds = matchingGroups.map(group => group.id);
    
    // Check if all matching groups are already selected
    const allSelected = matchingGroupIds.every(id => selectedGroups.includes(id));
    
    if (allSelected) {
      // Remove all matching groups
      setSelectedGroups(prev => prev.filter(id => !matchingGroupIds.includes(id)));
    } else {
      // Add all matching groups that aren't already selected
      setSelectedGroups(prev => {
        const newSelections = matchingGroupIds.filter(id => !prev.includes(id));
        return [...prev, ...newSelections];
      });
    }
  };

  const removeGroup = (groupId: string) => {
    setSelectedGroups(prev => prev.filter(id => id !== groupId));
  };

  return {
    open,
    setOpen,
    selectedGroups,
    associations,
    recipientGroups,
    loading,
    selectAllAssociations,
    commonGroups,
    handleSelectGroup,
    handleSelectAllForAssociation,
    handleSelectAll,
    handleSelectCommonType,
    removeGroup
  };
};

export default useRecipientSelector;
