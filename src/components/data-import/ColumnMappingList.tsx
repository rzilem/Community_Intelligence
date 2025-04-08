
import React, { useState } from 'react';
import ColumnMappingField from './ColumnMappingField';
import { MappingOption } from './types/mapping-types';

interface ColumnMappingListProps {
  fileColumns: string[];
  systemFields: MappingOption[];
  mappings: Record<string, string>;
  onMappingChange: (column: string, field: string) => void;
}

const ColumnMappingList: React.FC<ColumnMappingListProps> = ({
  fileColumns,
  systemFields,
  mappings,
  onMappingChange
}) => {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  const handleMappingChange = (column: string, field: string) => {
    onMappingChange(column, field);
    setOpenState(prev => ({
      ...prev,
      [column]: false
    }));
  };

  const setIsOpen = (column: string, isOpen: boolean) => {
    setOpenState(prev => ({
      ...prev,
      [column]: isOpen
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Map File Columns to System Fields:</h3>
      {fileColumns.map(column => (
        <ColumnMappingField
          key={column}
          column={column}
          systemFields={systemFields}
          selectedValue={mappings[column]}
          onMappingChange={handleMappingChange}
          isOpen={!!openState[column]}
          setIsOpen={(isOpen) => setIsOpen(column, isOpen)}
        />
      ))}
    </div>
  );
};

export default ColumnMappingList;
