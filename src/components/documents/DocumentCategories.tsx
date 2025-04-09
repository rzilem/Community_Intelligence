
import React from 'react';
import { FolderIcon, PlusCircleIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentCategory } from '@/types/document-types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentCategoriesProps {
  categories: DocumentCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onCreateCategory: () => void;
  isLoading?: boolean;
}

const DocumentCategories: React.FC<DocumentCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium mb-4">Document Categories</h3>
      
      <ScrollArea className="h-[calc(100vh-320px)] pr-3">
        <div className="space-y-1">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCategory(null)}
          >
            <FolderIcon className="mr-2 h-4 w-4" />
            All Documents
          </Button>
          
          {categories.length > 0 ? (
            categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectCategory(category.id)}
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2 px-4">No categories yet</p>
          )}
        </div>
      </ScrollArea>
      
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
