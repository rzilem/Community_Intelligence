
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCategory } from '@/types/communication-types';

interface CategorySelectorProps {
  category: MessageCategory;
  categories: { value: string; label: string }[];
  onCategoryChange: (value: MessageCategory) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  categories,
  onCategoryChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="category-select">Message Category</Label>
      </div>
      
      <Select 
        value={category} 
        onValueChange={(value) => onCategoryChange(value as MessageCategory)}
      >
        <SelectTrigger id="category-select" className="w-full">
          <SelectValue placeholder="Select message category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Select a category for this message. Recipients can filter notifications based on categories.
      </p>
    </div>
  );
};

export default CategorySelector;
