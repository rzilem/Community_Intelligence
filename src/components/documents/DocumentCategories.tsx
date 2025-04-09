
import React from 'react';
import { FolderIcon, PlusCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentCategory } from '@/types/document-types';

interface DocumentCategoriesProps {
  categories: DocumentCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onCreateCategory: () => void;
}

const DocumentCategories: React.FC<DocumentCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateCategory
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium mb-4">Document Categories</h3>
      
      <div className="space-y-1">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onSelectCategory(null)}
        >
          <FolderIcon className="mr-2 h-4 w-4" />
          All Documents
        </Button>
        
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCategory(category.id)}
          >
            <FolderIcon className="mr-2 h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </div>
      
      <Button
        variant="ghost"
        className="w-full justify-start mt-4"
        onClick={onCreateCategory}
      >
        <PlusCircleIcon className="mr-2 h-4 w-4" />
        Create Category
      </Button>
    </div>
  );
};

export default DocumentCategories;
