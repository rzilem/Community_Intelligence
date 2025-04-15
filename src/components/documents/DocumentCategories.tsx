
import React from 'react';
import { FolderIcon, PlusCircleIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentCategory } from '@/types/document-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import TooltipButton from '@/components/ui/tooltip-button';

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
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Document Categories</h3>
        <TooltipButton 
          variant="ghost" 
          size="sm" 
          onClick={onCreateCategory}
          tooltip="Create a new document category"
        >
          <PlusCircleIcon className="h-4 w-4" />
        </TooltipButton>
      </div>
      
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
            <div className="text-sm text-muted-foreground py-2 px-4 flex flex-col items-center space-y-2">
              <p>No categories yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCreateCategory}
                className="w-full"
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DocumentCategories;
