
import React from 'react';
import ColumnSelector from '@/components/table/ColumnSelector';
import { DocumentColumn } from '@/hooks/documents/useDocumentColumns';

interface DocumentColumnSelectorProps {
  columns: DocumentColumn[];
  selectedColumns: string[];
  onChange: (selectedColumns: string[]) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
  resetToDefaults?: () => void;
  className?: string;
}

const DocumentColumnSelector: React.FC<DocumentColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  onReorder,
  resetToDefaults,
  className
}) => {
  return (
    <ColumnSelector
      columns={columns}
      selectedColumns={selectedColumns}
      onChange={onChange}
      onReorder={onReorder}
      className={className}
    />
  );
};

export default DocumentColumnSelector;
