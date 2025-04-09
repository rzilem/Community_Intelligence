
import React from 'react';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentCategory } from '@/types/document-types';

interface DocumentCategoriesProps {
  categories: DocumentCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onCreateCategory: () => void;
}

const DocumentCategories: React.FC<DocumentCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateCategory
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-medium">Select Association</h3>
        {/* The AssociationSelector component will be used here in the actual implementation */}
      </div>
      
      <div>
        <Input 
          placeholder="Search categories..." 
          className="mb-4"
        />
      </div>
      
      <div>
        <h3 className="mb-2 text-lg font-medium">Document Categories</h3>
        <ul className="space-y-1">
          <li>
            <Button
              variant={selectedCategory === null ? "secondary" : "ghost"}
              className="w-full justify-start text-left"
              onClick={() => onSelectCategory(null)}
            >
              <Folder className="mr-2 h-4 w-4" />
              All Documents
            </Button>
          </li>
          
          {categories.map(category => (
            <li key={category.id}>
              <Button
                variant={selectedCategory === category.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => onSelectCategory(category.id)}
              >
                <Folder className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onCreateCategory}
      >
        <Plus className="mr-2 h-4 w-4" /> Create Category
      </Button>
    </div>
  );
};

export default DocumentCategories;
