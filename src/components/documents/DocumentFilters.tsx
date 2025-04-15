
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DocumentCategories from './DocumentCategories';
import { DocumentCategory } from '@/types/document-types';
import { useAssociations } from '@/hooks/associations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DocumentFiltersProps {
  categories: DocumentCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onCreateCategory: () => void;
  categoriesLoading?: boolean;
  onAssociationChange: (id: string) => void;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
  categoriesLoading = false,
  onAssociationChange
}) => {
  const { associations = [], isLoading: associationsLoading } = useAssociations();

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="association-select">Select Association</Label>
          <Select 
            onValueChange={onAssociationChange} 
            disabled={associationsLoading}
          >
            <SelectTrigger id="association-select" className="w-full">
              <SelectValue placeholder="Select an association" />
            </SelectTrigger>
            <SelectContent>
              {associations.map((association: any) => (
                <SelectItem key={association.id} value={association.id}>
                  {association.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DocumentCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          onCreateCategory={onCreateCategory}
          isLoading={categoriesLoading}
        />
      </CardContent>
    </Card>
  );
};

export default DocumentFilters;
