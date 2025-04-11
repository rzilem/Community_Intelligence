
import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command } from '@/components/ui/command';
import useRecipientSelector from './recipient-selector/useRecipientSelector';
import SelectedGroupBadges from './recipient-selector/SelectedGroupBadges';
import RecipientSelectorContent from './recipient-selector/RecipientSelectorContent';

interface RecipientSelectorProps {
  onSelectionChange: (selectedGroups: string[]) => void;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({ onSelectionChange }) => {
  const {
    open,
    setOpen,
    selectedGroups,
    associations,
    recipientGroups,
    loading,
    selectAllAssociations,
    handleSelectGroup,
    handleSelectAllForAssociation,
    handleSelectAll,
    handleSelectCommonType,
    removeGroup
  } = useRecipientSelector(onSelectionChange);

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
                <SelectedGroupBadges
                  selectedGroups={selectedGroups}
                  recipientGroups={recipientGroups}
                  associations={associations}
                  removeGroup={removeGroup}
                />
              ) : (
                <span className="text-muted-foreground">Select recipient groups...</span>
              )}
            </div>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <RecipientSelectorContent
              loading={loading}
              recipientGroups={recipientGroups}
              selectedGroups={selectedGroups}
              associations={associations}
              selectAllAssociations={selectAllAssociations}
              handleSelectCommonType={handleSelectCommonType}
              handleSelectAll={handleSelectAll}
              handleSelectAllForAssociation={handleSelectAllForAssociation}
              handleSelectGroup={handleSelectGroup}
            />
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RecipientSelector;
