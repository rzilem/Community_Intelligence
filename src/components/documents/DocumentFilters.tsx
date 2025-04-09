
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DocumentCategories from '@/components/documents/DocumentCategories';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { DocumentCategory } from '@/types/document-types';

interface DocumentFiltersProps {
  categories: DocumentCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onCreateCategory: () => void;
  categoriesLoading: boolean;
  onAssociationChange: (associationId: string) => void;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
  categoriesLoading,
  onAssociationChange
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <AssociationSelector
          onAssociationChange={onAssociationChange}
        />
        
        <div className="mt-6">
          <DocumentCategories
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            onCreateCategory={onCreateCategory}
            isLoading={categoriesLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentFilters;
